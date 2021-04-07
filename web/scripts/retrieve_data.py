import argparse
import chardet
import csv
import json
import math
import os
import pycountry
import pycountry_convert
import pycld2
import re
import requests
import time

from PIL import Image
from datetime import datetime
from google.cloud import bigquery
from google.cloud import translate_v3beta1 as translate
from io import BytesIO

raw_data_dir = "raw_data"
raw_data_fi = os.path.join(raw_data_dir, "data.jsonl")
orig_names_fi = os.path.join(raw_data_dir, "company_names.jsonl")
exchange_link_fi = os.path.join(raw_data_dir, "exchange_links.jsonl")
supplemental_descriptions = os.path.join(raw_data_dir, "supplemental_company_descriptions.csv")
web_src_dir = os.path.join("ai_companies_viz", "src")
image_dir = os.path.join(raw_data_dir, "logos")
country_name_map = {
    "Korea, Republic of": "South Korea",
    "Taiwan, Province of China": "Taiwan"
}
company_name_map = {
    "睿思芯科": "RiVAI",
    "江行智能": "Jiangxing Intelligence",
    "智易科技": "Zhiyi Tech",
    "创新奇智": "AInnovation",
    "captricity": "Vidado"
}
reverse_company_name_map = {v: k for k, v in company_name_map.items()}
crunchbase_url_override = {
    "https://www.crunchbase.com/organization/embodied-intelligence?utm_source=crunchbase&utm_medium=export&utm_campaign=odm_csv": "https://www.crunchbase.com/organization/covariant"
}
client = translate.TranslationServiceClient()
parent = client.location_path("gcp-cset-projects", "global")
link_css = "'MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary'"

def get_exchange_link(market_key) -> str:
    time.sleep(5)
    # for some mysterious reason, the ticker/market ordering is alphabetical in google finance
    first, last = sorted(market_key.split(":"))
    gf_link = f"https://www.google.com/finance/quote/{first}:{last}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:87.0) Gecko/20100101 Firefox/87.0"
    }
    r = requests.get(gf_link, headers=headers)
    if "No results found" in r.text:
        gf_link = f"https://www.google.com/finance/quote/{last}:{first}"
        time.sleep(5)
        r = requests.get(gf_link, headers=headers)
        return {"market_key": market_key, "link": None if "No results found" in r.text else gf_link}
    else:
        return {"market_key": market_key, "link": gf_link}

def retrieve_raw(get_links: bool) -> None:
    client = bigquery.Client()
    market_info = set()
    print("retrieving metadata")
    with open(raw_data_fi, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.visualization_data"):
            dict_row = {col: row[col] for col in row.keys()}
            out.write(json.dumps(dict_row)+"\n")
            market_info = market_info.union([m["exchange"]+":"+m["ticker"] for m in dict_row["market"]])
    print("retrieving original company names")
    with open(orig_names_fi, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.original_company_names"):
            name = row["name"]
            if name is None:
                continue
            row = {"orig_name": name, "lowercase_name": name.lower()}
            out.write(json.dumps(row)+"\n")
    if get_links:
        print("retrieving market links")
        with open(exchange_link_fi, mode="w") as out:
            for mi in market_info:
                mi_row = get_exchange_link(mi)
                print(mi_row)
                out.write(json.dumps(mi_row)+"\n")

def retrieve_image(url: str, company_name: str, refresh_images: bool) -> str:
    if not url:
        return None
    cleanup = {
        " ": "_",
        "(": "",
        ")": "",
        "/": "_",
        ".": "",
        "!": ""
    }
    company_name = company_name.lower()
    for from_char, to_char in cleanup.items():
        company_name = company_name.replace(from_char, to_char)
    img_name = company_name.strip()+".png"
    if refresh_images:
        response = requests.get(url)
        if response.status_code == 200:
            Image.open(BytesIO(response.content)).save(os.path.join(web_src_dir, "images", img_name))
            return img_name
        else:
            print("Download failed for "+url)
            return None
    elif img_name in os.listdir(os.path.join(web_src_dir, "images")):
        return img_name
    return None

def clean_parent(parents: list, lowercase_to_orig_cname: dict) -> str:
    if len(parents) == 0:
        return None
    cleaned_parents = [clean_company_name(parent["parent_name"], lowercase_to_orig_cname)+
                       (" (Acquired)" if parent["parent_acquisition"] else "")
                      for parent in parents]
    return ", ".join(cleaned_parents)

def clean_children(children: list, lowercase_to_orig_cname: dict) -> str:
    if len(children) == 0:
        return None
    return  ", ".join([clean_company_name(c["child_name"], lowercase_to_orig_cname) for c in children])

def clean_market(market_info: list, market_key_to_link: dict) -> str:
    if len(market_info) == 0:
        return []
    ref_market_info = []
    for m in market_info:
        market_key = f"{m['exchange'].upper()}:{m['ticker'].upper()}"
        ref_market_info.append({
            "market_key": market_key,
            "link": market_key_to_link[market_key]
        })
    return ref_market_info

def clean_wiki_description(wiki_desc: str) -> str:
    clean_wiki_desc = re.sub(r"\[\d+\]", "", wiki_desc)
    clean_wiki_desc = re.sub(r"\s*\([^\)]*[/\[][^\)]*\)\s*", " ", clean_wiki_desc)
    return clean_wiki_desc

def add_ranks(rows: list, metrics: list) -> None:
    """
    Mutates `rows`
    :param rows:
    :param metrics:
    :return:
    """
    for metric in metrics:
        curr_rank = 0
        curr_value = 100000000000
        rows.sort(key=lambda r: -1*r[metric])
        max_metric = math.log(max([r[metric] for r in rows])+1, 2)
        for idx, row in enumerate(rows):
            if row[metric] < curr_value:
                curr_rank = idx+1
                curr_value = row[metric]
            row[metric] = {
                "value": row[metric],
                "rank": curr_rank,
                "frac_of_max": math.log(row[metric]+1, 2)/max_metric
            }

def get_translation(desc: str) -> str:
    if desc is None or len(desc.strip()) == 0:
        return None
    try:
        is_reliable, text_bytes_found, details = pycld2.detect(desc)
    except pycld2.error as e:
        encoding = chardet.detect(desc.encode("utf-8"))["encoding"]
        if encoding is None:
            encoding = "latin-1"  # last-ditch effort...
        try:
            is_reliable, text_bytes_found, details = pycld2.detect(desc.encode("utf-8").decode(encoding))
        except:
            print("Error on "+desc)
            return None
    if details[0][1].lower() != "en":
        print("Translating "+desc)
        response = client.translate_text(
            parent=parent,
            contents=[desc],
            mime_type="text/plain",
            target_language_code="en"
        )
        translation = response.translations[0].translated_text.strip()
        return translation
    return None

def add_supplemental_descriptions(rows: list) -> None:
    name_to_desc_info = {}
    # map keys from csv to keys for javascript
    desc_info = {
        "wikipedia_description": "wikipedia_description",
        "wikipedia_description_link": "wikipedia_link",
        "company_description": "company_site_description",
        "company_description_link": "company_site_link",
        "retrieval_date": "description_retrieval_date"
    }
    with open(supplemental_descriptions) as f:
        for row in csv.DictReader(f):
            company_name = row["company_name"]
            name_to_desc_info[company_name] = {desc_info[k]: row[k].strip() for k in desc_info}
            wiki_description = name_to_desc_info[company_name]["wikipedia_description"]
            name_to_desc_info[company_name]["wikipedia_description"] = clean_wiki_description(wiki_description)
            wiki_link = name_to_desc_info[company_name]["wikipedia_link"]
            if not (wiki_link and ("http" in wiki_link or ".org" in wiki_link)):
                if wiki_description:
                    print(f"{company_name} missing wiki link")
                name_to_desc_info[company_name]["wikipedia_link"] = None
                name_to_desc_info[company_name]["wikipedia_description"] = None
            source_description = name_to_desc_info[company_name]["company_site_description"]
            translation = get_translation(source_description)
            name_to_desc_info[company_name]["company_site_description_translation"] = translation
            source_link = name_to_desc_info[company_name]["company_site_link"]
            if not (source_link and ("http" in source_link or ".com" in source_link)):
                if source_description:
                    print(f"{company_name} missing source link")
                name_to_desc_info[company_name]["company_site_description"] = None
                name_to_desc_info[company_name]["company_site_link"] = None
                name_to_desc_info[company_name]["company_site_description_translation"] = None
    for row in rows:
        company_name = row["name"].strip().lower()
        if row["name"] in reverse_company_name_map:
            company_name = reverse_company_name_map[row["name"]]
        if company_name in name_to_desc_info:
            row.update(name_to_desc_info[company_name])

def clean_country(country: str) -> str:
    if country is None:
        return None
    country_obj = pycountry.countries.get(alpha_2=country)
    if not country_obj:
        country_obj = pycountry.countries.get(alpha_3=country)
    if country_obj.name in country_name_map:
        return country_name_map[country_obj.name]
    return country_obj.name

def get_continent(country: str) -> str:
    if country is None:
        return None
    alpha2 = pycountry_convert.country_name_to_country_alpha2(country)
    continent_code = pycountry_convert.country_alpha2_to_continent_code(alpha2)
    continent = pycountry_convert.convert_continent_code_to_continent_name(continent_code)
    return continent

def clean_company_name(name: str, lowercase_to_orig_cname: dict) -> str:
    clean_name = name.strip()
    if clean_name in company_name_map:
        return company_name_map[clean_name]
    if clean_name in lowercase_to_orig_cname:
        return lowercase_to_orig_cname[clean_name]
    return clean_name.title()

def clean_aliases(aliases: list, lowercase_to_orig_cname: dict, orig_name: str = None) -> str:
    unique_aliases = {clean_company_name(a["alias"], lowercase_to_orig_cname).strip('.') for a in aliases}
    if orig_name is not None:
        unique_aliases.add(orig_name)
    sorted_aliases = sorted(list(unique_aliases))
    return None if len(aliases) == 0 else f"{'; '.join(sorted_aliases)}"

def clean(refresh_images: bool) -> None:
    rows = []
    missing_all = set()
    lowercase_to_orig_cname = {}
    with open(orig_names_fi) as f:
        for line in f:
            js = json.loads(line)
            lowercase_to_orig_cname[js["lowercase_name"]] = js["orig_name"]
    market_key_to_link = {}
    with open(exchange_link_fi) as f:
        for line in f:
            js = json.loads(line)
            market_key_to_link[js["market_key"].upper()] = js["link"]
    with open(raw_data_fi) as f:
        for row in f:
            js = json.loads(row)
            orig_company_name = js["name"]
            js["name"] = clean_company_name(orig_company_name, lowercase_to_orig_cname)
            js["country"] = clean_country(js["country"])
            js["continent"] = get_continent(js["country"])
            logo_url = js.pop("logo_url")
            js["local_logo"] = retrieve_image(logo_url, orig_company_name, refresh_images)
            js["aliases"] = clean_aliases(js.pop("aliases"), lowercase_to_orig_cname,
                                          orig_company_name if orig_company_name != js["name"].lower() else None)
            js["stage"] = js["stage"] if js["stage"] else "Unknown"
            grids = js.pop("grid")
            js["grid_info"] = ", ".join(grids)
            js["grid_links"] = {"__html": ", ".join([(f"<a class={link_css} target='blank' rel='noreferrer' "
                                                     f"href='https://www.grid.ac/institutes/{grid}'>{grid}</a>")
                                                    for grid in grids])}
            permids = js.pop("permid")
            js["permid_info"] = ", ".join([str(p) for p in permids])
            js["permid_links"] = {"__html": ", ".join([(f"<a class={link_css} target='blank' rel='noreferrer' "
                                                     f"href='https://permid.org/{permid}'>{permid}</a>")
                                                    for permid in permids])}
            js["parent_info"] = clean_parent(js.pop("parent"), lowercase_to_orig_cname)
            js["agg_child_info"] = clean_children(js.pop("children"), lowercase_to_orig_cname)
            js["unagg_child_info"] = clean_children(js.pop("non_agg_children"), lowercase_to_orig_cname)
            js["years"] = list(range(2010, datetime.now().year+1))
            all_pubs_by_year = {p["year"]: p["all_pubs"] for p in js.pop("all_pubs_by_year")}
            js["yearly_all_publications"] = [0 if y not in all_pubs_by_year else all_pubs_by_year[y]
                                             for y in js["years"]]
            ai_pubs_by_year = {p["year"]: p["ai_pubs"] for p in js.pop("ai_pubs_by_year")}
            js["yearly_ai_publications"] = [0 if y not in ai_pubs_by_year else ai_pubs_by_year[y]
                                            for y in js["years"]]
            js["ai_pubs"] = sum(js["yearly_ai_publications"])
            for year_idx in range(len(js["years"])):
                if js["yearly_all_publications"][year_idx] < js["yearly_ai_publications"][year_idx]:
                    missing_all.add(js["name"])
            ai_patents_by_year = {p["priority_year"]: p["ai_patents"] for p in js.pop("ai_patents_by_year")}
            js["yearly_ai_patents"] = [0 if y not in ai_patents_by_year else ai_patents_by_year[y]
                                       for y in js["years"]]
            js["ai_patents"] = sum(js["yearly_ai_patents"])
            ai_pubs_in_top_conf = {p["year"]: p["ai_pubs_in_top_conferences"]
                                   for p in js.pop("ai_pubs_in_top_conferences_by_year")}
            js["yearly_ai_pubs_top_conf"] = [0 if y not in ai_pubs_in_top_conf else ai_pubs_in_top_conf[y]
                                             for y in js["years"]]
            js["ai_pubs_in_top_conferences"] = sum(js["yearly_ai_pubs_top_conf"])
            js["market"] = clean_market(js.pop("market"), market_key_to_link)
            js["market_list"] = ", ".join([m["market_key"] for m in js["market"]])
            if js["website"] and not js["website"].startswith("http"):
                js["website"] = "https://"+js["website"]
            js["crunchbase_description"] = js.pop("short_description")
            if ("crunchbase" in js) and ("crunchbase_url" in js["crunchbase"]):
                url = js["crunchbase"]["crunchbase_url"]
                if url in crunchbase_url_override:
                    js["crunchbase"]["crunchbase_url"] = crunchbase_url_override[url]
            rows.append(js)
    add_ranks(rows, ["ai_patents", "ai_pubs", "ai_pubs_in_top_conferences"])
    add_supplemental_descriptions(rows)
    with open(os.path.join(web_src_dir, "static_data", "data.js"), mode="w") as out:
        out.write(f"const company_data = {json.dumps(rows)};\n\nexport {{ company_data }};")
    print(f"missing all pubs years: {missing_all}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh_raw", action="store_true", default=False)
    parser.add_argument("--refresh_images", action="store_true", default=False)
    parser.add_argument("--refresh_market_links", action="store_true", default=False)
    args = parser.parse_args()

    if args.refresh_market_links and not args.refresh_raw:
        print("You must specify --refresh_raw if you want to refresh the market links")
        exit(0)

    if args.refresh_raw:
        retrieve_raw(args.refresh_market_links)
    clean(args.refresh_images)