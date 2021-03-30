import argparse
import csv
import json
import math
import os
import pycountry
import re
import requests

from PIL import Image
from datetime import datetime
from google.cloud import bigquery
from io import BytesIO

raw_data_dir = "raw_data"
raw_data_fi = os.path.join(raw_data_dir, "data.jsonl")
orig_names_fi = os.path.join(raw_data_dir, "company_names.jsonl")
supplemental_descriptions = os.path.join(raw_data_dir, "supplemental_company_descriptions.csv")
web_src_dir = os.path.join("ai_companies_viz", "src")
image_dir = os.path.join(raw_data_dir, "logos")
country_name_map = {
    "Korea, Republic of": "South Korea",
    "Taiwan, Province of China": "Taiwan"
}

def retrieve_raw() -> None:
    client = bigquery.Client()
    with open(raw_data_fi, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.visualization_data"):
            dict_row = {col: row[col] for col in row.keys()}
            out.write(json.dumps(dict_row)+"\n")
    with open(orig_names_fi, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.original_company_names"):
            name = row["name"]
            if name is None:
                continue
            row = {"orig_name": name, "lowercase_name": name.lower()}
            out.write(json.dumps(row)+"\n")

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

def clean_market(market_info: list) -> str:
    if len(market_info) == 0:
        return None
    return ", ".join([f"{m['exchange'].upper()}:{m['ticker'].upper()}" for m in market_info])

def clean_wiki_description(wiki_desc: str) -> str:
    clean_wiki_desc = re.sub(r"\[\d+\]", "", wiki_desc)
    clean_wiki_desc = re.sub(r"\s*\([^\)]*/[^\)]*\)\s*", " ", clean_wiki_desc)
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
            source_link = name_to_desc_info[company_name]["company_site_link"]
            if not (source_link and ("http" in source_link or ".com" in source_link)):
                if source_description:
                    print(f"{company_name} missing source link")
                name_to_desc_info[company_name]["company_site_description"] = None
                name_to_desc_info[company_name]["company_site_link"] = None
    for row in rows:
        company_name = row["name"].strip().lower()
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

def clean_company_name(name: str, lowercase_to_orig_cname: dict) -> str:
    clean_name = name.strip()
    if clean_name in lowercase_to_orig_cname:
        return lowercase_to_orig_cname[clean_name]
    return clean_name.title()

def clean_aliases(aliases: list, lowercase_to_orig_cname: dict) -> str:
    unique_aliases = sorted(list({clean_company_name(a["alias"], lowercase_to_orig_cname).strip('.') for a in aliases}))
    return None if len(aliases) == 0 else f"{'; '.join(unique_aliases)}"

def clean(refresh_images: bool) -> None:
    rows = []
    missing_all = set()
    lowercase_to_orig_cname = {}
    with open(orig_names_fi) as f:
        for line in f:
            js = json.loads(line)
            lowercase_to_orig_cname[js["lowercase_name"]] = js["orig_name"]
    with open(raw_data_fi) as f:
        for row in f:
            js = json.loads(row)
            js["name"] = clean_company_name(js["name"], lowercase_to_orig_cname)
            js["country"] = clean_country(js["country"])
            logo_url = js.pop("logo_url")
            js["local_logo"] = retrieve_image(logo_url, js["name"], refresh_images)
            js["aliases"] = clean_aliases(js.pop("aliases"), lowercase_to_orig_cname)
            js["stage"] = js["stage"] if js["stage"] else "Unknown"
            grids = js.pop("grid")
            js["grid_info"] = ", ".join(grids)
            permids = js.pop("permid")
            js["permid_info"] = ", ".join([str(p) for p in permids])
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
            js["market"] = clean_market(js.pop("market"))
            js["crunchbase_description"] = js.pop("short_description")
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
    args = parser.parse_args()

    if args.refresh_raw:
        retrieve_raw()
    clean(args.refresh_images)