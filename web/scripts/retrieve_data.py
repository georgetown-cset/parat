import argparse
import chardet
import copy
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

"""
Retrieves and reformats raw data for consumption by javascript
"""

### CONSTANTS ###

RAW_DATA_DIR = "raw_data"
WEB_SRC_DIR = os.path.join("gui-v2", "src")
IMAGE_DIR = os.path.join(WEB_SRC_DIR, "images")

# Local cache of raw data (ai_companies_visualization.visualization_data)
RAW_DATA_FI = os.path.join(RAW_DATA_DIR, "data.jsonl")
# Local cache of ai_companies_visualization.original_company_names; used to map lowercased versions of
# company names back to original casing, where available
ORIG_NAMES_FI = os.path.join(RAW_DATA_DIR, "company_names.jsonl")
# Cache of links to Google Finance page
EXCHANGE_LINK_FI = os.path.join(RAW_DATA_DIR, "exchange_links.jsonl")
# Download of https://docs.google.com/spreadsheets/d/1OpZGUG9y0onZfRfx9aVgRWiYSFWJ-TRsDQwYtcniCB0/edit#gid=468518268
# containing student-retrieved company descriptions to supplement crunchbase
SUPPLEMENTAL_DESCRIPTIONS = os.path.join(RAW_DATA_DIR, "supplemental_company_descriptions.csv")

# Maps pycountry country names to more user-friendly ones
COUNTRY_NAME_MAP = {
    "Korea, Republic of": "South Korea",
    "Taiwan, Province of China": "Taiwan"
}
# Maps original company name from raw data to version of the name we should display as the canonical one in the UI
COMPANY_NAME_MAP = {
    "睿思芯科": "RiVAI",
    "江行智能": "Jiangxing Intelligence",
    "智易科技": "Zhiyi Tech",
    "创新奇智": "AInnovation",
    "captricity": "Vidado"
}
REVERSE_COMPANY_NAME_MAP = {v: k for k, v in COMPANY_NAME_MAP.items()}
# Maps broken links from crunchbase to correct ones
CRUNCHBASE_URL_OVERRIDE = {
    ("https://www.crunchbase.com/organization/embodied-intelligence?utm_source=crunchbase&utm_medium=export&"
     "utm_campaign=odm_csv"): "https://www.crunchbase.com/organization/covariant"
}
# Exchanges to show in the "main metadata" (as opposed to expanded metadata) view; selected by Zach
FILT_EXCHANGES = {"NYSE", "NASDAQ", "SSE", "SZSE", "SEHK", "HKG", "TPE", "TYO", "KRX"}

APPLICATION_PATENT_CATEGORIES = {"Language_Processing", "Speech_Processing", "Knowledge_Representation", "Planning_and_Scheduling", "Control", "Distributed_AI", "Robotics", "Computer_Vision", "Analytics_and_Algorithms", "Measuring_and_Testing"}
INDUSTRY_PATENT_CATEGORIES = {"Physical_Sciences_and_Engineering", "Life_Sciences", "Security__eg_cybersecurity", "Transportation", "Industrial_and_Manufacturing", "Education", "Document_Mgt_and_Publishing", "Military", "Agricultural", "Computing_in_Government", "Personal_Devices_and_Computing", "Banking_and_Finance", "Telecommunications", "Networks__eg_social_IOT_etc", "Business", "Energy_Management", "Entertainment", "Nanotechnology", "Semiconductors"}

ARTICLE_METRICS = "articles"
PATENT_METRICS = "patents"
OTHER_METRICS = "other_metrics"
METRIC_LISTS = [ARTICLE_METRICS, PATENT_METRICS, OTHER_METRICS]

_curr_time = datetime.now()
CURRENT_YEAR = _curr_time.year if _curr_time.month > 6 else _curr_time.year - 1
YEARS = list(range(CURRENT_YEAR - 10, CURRENT_YEAR + 1))

GROUP_NAMES_TO_KEYS = {
    "S&P 500": "sp500",
    "Fortune Global 500": "global500"
}

### END CONSTANTS ###


def get_exchange_link(market_key: str) -> dict:
    """
    Given a exchange:ticker market key, check google finance links for both exchange:ticker and ticker:exchange
    (ordering is not consistent and at most one variant leads to a valid url).
    :param market_key: exchange:ticker
    :return: A dict mapping market_key to the input market_key and link to the link, if successfully found, else None
    """
    time.sleep(5)
    # for some mysterious reason, the ticker/market ordering is alphabetical in google finance
    first, last = sorted(market_key.strip(":").split(":"))
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
    """
    Retrieve raw data from the ai_companies_visualization dataset in BQ
    :param get_links: If true, will refresh the cache of market links (this takes about 1.5-2 hrs at the moment
    so only use this parameter if you need to
    :return: None
    """
    client = bigquery.Client()
    market_info = set()
    print("retrieving metadata")
    with open(RAW_DATA_FI, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.all_visualization_data"):
            dict_row = {col: row[col] for col in row.keys()}
            out.write(json.dumps(dict_row)+"\n")
            market_info = market_info.union([m["exchange"]+":"+m["ticker"] for m in dict_row["market"]])
    print("retrieving original company names")
    with open(ORIG_NAMES_FI, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.original_company_names"):
            name = row["name"]
            if name is None:
                continue
            row = {"orig_name": name, "lowercase_name": name.lower()}
            out.write(json.dumps(row)+"\n")
    if get_links:
        print("retrieving market links")
        with open(EXCHANGE_LINK_FI, mode="w") as out:
            for mi in market_info:
                mi_row = get_exchange_link(mi)
                out.write(json.dumps(mi_row)+"\n")


def retrieve_image(url: str, company_name: str, refresh_images: bool) -> str:
    """
    Retrieves company logos from crunchbase links
    :param url: Link to logo from crunchbase
    :param company_name: Name of company (used to generate an image name)
    :param refresh_images: If false, doesn't actually re-download the images, and just re-generates the name
    :return: The image filename
    """
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
            try:
                Image.open(BytesIO(response.content)).save(os.path.join(IMAGE_DIR, img_name))
            except Exception as e:
                print(f"{e} occurred when downloading {url} to {img_name}, trying jpg download")
                try:
                    img_name = company_name.strip()+".jpg"
                    Image.open(BytesIO(response.content)).save(os.path.join(IMAGE_DIR, img_name))
                except Exception as e:
                    print(f"{e} occurred when downloading {url} to {img_name}, forcing download to svg, "
                          f"manually check this file")
                    img_name = company_name.strip()+".svg"
                    with open(os.path.join(IMAGE_DIR, img_name), mode="wb") as f:
                        f.write(response.content)
            return img_name
        else:
            print("Download failed for "+url)
            return None
    elif img_name in os.listdir(os.path.join(IMAGE_DIR)):
        return img_name
    return None


def clean_parent(parents: list, lowercase_to_orig_cname: dict) -> str:
    """
    Cleans a list of company parent names
    :param parents: List of strings which are company parent names
    :param lowercase_to_orig_cname: Maps lowercase name to originally-cased name
    :return: A string containing a comma-separated list of cleaned company parent names
    """
    if len(parents) == 0:
        return None
    cleaned_parents = [clean_company_name(parent["parent_name"], lowercase_to_orig_cname)+
                       (" (Acquired)" if parent["parent_acquisition"] else "")
                      for parent in parents]
    return ", ".join(cleaned_parents)


def clean_children(children: list, lowercase_to_orig_cname: dict) -> str:
    """
    Cleans a list of company children names
    :param childrens: List of strings which are company children names
    :param lowercase_to_orig_cname: Maps lowercase name to originally-cased name
    :return: A string containing a comma-separated list of cleaned company children names
    """
    if len(children) == 0:
        return None
    return ", ".join([clean_company_name(c["child_name"], lowercase_to_orig_cname) for c in children])


def clean_market(market_info: list, market_key_to_link: dict) -> list:
    """
    Cleans/reformats list of exchange information
    :param market_info: List of dicts of exchange/ticker info
    :param market_key_to_link: Dict mapping exchange:ticker strings to google finance links where available
    :return: List of dicts of market keys (exchange:ticker strings) and links
    """
    if len(market_info) == 0:
        return []
    ref_market_info = []
    for m in market_info:
        market_key = f"{m['exchange'].upper()}:{m['ticker'].upper()}"
        ref_market_info.append({
            "text": market_key,
            "url": market_key_to_link[market_key]
        })
    return ref_market_info


def clean_wiki_description(wiki_desc: str) -> str:
    """
    Clean stuff like the parenthetical pronunciation info and reference numbers out of the wiki descriptions
    :param wiki_desc: First paragraph of a wikipedia page
    :return: cleaned wiki_desc
    """
    clean_wiki_desc = re.sub(r"\[\d+\]", "", wiki_desc)
    clean_wiki_desc = re.sub(r"\s*\([^\)]*[/\[][^\)]*\)\s*", " ", clean_wiki_desc)
    return clean_wiki_desc


def get_metric_value(row: dict, metric_list_name: str, metric_name: str) -> float:
    """
    Extract the "total" value of a metric from a row
    :param row: Row of data
    :param metric_list_name: Metric list containing `metric_name`
    :param metric_name: Name of metric to retrieve a total value for
    :return: Total value of `metric` in row
    """
    total = row[metric_list_name].get(metric_name, {}).get("total", 0)
    return total if total else 0


def add_ranks(rows: list) -> None:
    """
    Add row ranks to all metrics in our metric lists
    :param rows: PARAT data rows
    :return: None (mutates `rows`)
    """
    for metric_list_name in METRIC_LISTS:
        all_metrics = set()
        for row in rows:
            for metric in row.get(metric_list_name, {}):
                all_metrics.add(metric)
        for metric in sorted(list(all_metrics)):
            curr_rank = 0
            curr_value = 100000000000
            rows.sort(key=lambda r: -1*get_metric_value(r, metric_list_name, metric))
            max_metric = math.log(max([get_metric_value(r, metric_list_name, metric) for r in rows])+1, 2)
            for idx, row in enumerate(rows):
                metric_value = get_metric_value(row, metric_list_name, metric)
                if metric_value < curr_value:
                    curr_rank = idx+1
                    curr_value = metric_value
                if metric not in row[metric_list_name]:
                    row[metric_list_name][metric] = {"total": metric_value}
                row[metric_list_name][metric].update({
                    "rank": curr_rank,
                    # used to scale color
                    "frac_of_max": round(math.log(metric_value+1, 2)/max_metric, 4)
                })


def get_translation(desc: str, client, parent) -> str:
    """
    Get translation of non-english company descriptions. Returns None if `desc` cannot be translated or if it is
    English already according to pycld2
    :param desc: Description form any language.
    :param client: Google Translation Client
    :param parent: Parent project
    :return: translation of `desc` or None
    """
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
        except Exception as e1:
            print(e1)
            print("Error on "+desc)
            return None
    # Check if desc appears to be in English, and if not, translate it
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
    """
    Adds student-retrieved descriptions of companies to `rows`
    :param rows: list of dicts of company metadata
    :return: None; mutates rows
    """
    name_to_desc_info = {}
    # map keys from csv to keys for javascript
    desc_info = {
        "wikipedia_description": "wikipedia_description",
        "wikipedia_description_link": "wikipedia_link",
        "company_description": "company_site_description",
        "company_description_link": "company_site_link",
        "retrieval_date": "description_retrieval_date"
    }
    with open(SUPPLEMENTAL_DESCRIPTIONS) as f:
        client = translate.TranslationServiceClient()
        parent = client.location_path("gcp-cset-projects", "global")
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
            translation = get_translation(source_description, client, parent)
            name_to_desc_info[company_name]["company_site_description_translation"] = translation
            source_link = clean_link(name_to_desc_info[company_name]["company_site_link"])
            name_to_desc_info[company_name]["company_site_link"] = source_link
            if row["company_homepage"]:
                name_to_desc_info[company_name]["website"] = row["company_homepage"]
            if not (source_link and ("http" in source_link or ".com" in source_link)):
                if source_description:
                    print(f"{company_name} missing source link")
                    print(source_description)
                name_to_desc_info[company_name]["company_site_description"] = None
                name_to_desc_info[company_name]["company_site_link"] = None
                name_to_desc_info[company_name]["company_site_description_translation"] = None
    for row in rows:
        company_name = row["name"].strip().lower()
        if row["name"] in REVERSE_COMPANY_NAME_MAP:
            company_name = REVERSE_COMPANY_NAME_MAP[row["name"]]
        if company_name in name_to_desc_info:
            curr_website = "" if "website" not in row else row["website"]
            new_website = "" if "website" not in name_to_desc_info[company_name] else \
                            name_to_desc_info[company_name]["website"]
            if new_website and new_website.startswith("http") and curr_website != new_website:
                print(f'Website mismatch from crunchbase ({curr_website}) and '
                      f'from manual entry ({new_website}); using '
                      f'manual entry!')
            row.update(name_to_desc_info[company_name])


def clean_country(country: str) -> str:
    """
    Convert country abbreviation to full country name
    :param country: country abbreviation from raw data
    :return: country name
    """
    if country is None:
        return None
    country_obj = pycountry.countries.get(alpha_2=country)
    if not country_obj:
        country_obj = pycountry.countries.get(alpha_3=country)
    if not country_obj:
        print(f"{country} not found")
        return None
    if country_obj.name in COUNTRY_NAME_MAP:
        return COUNTRY_NAME_MAP[country_obj.name]
    return country_obj.name


def get_continent(country: str) -> str:
    """
    Get continent of country
    :param country: Name of a country
    :return: Country's continent
    """
    if country is None:
        return None
    alpha2 = pycountry_convert.country_name_to_country_alpha2(country)
    continent_code = pycountry_convert.country_alpha2_to_continent_code(alpha2)
    continent = pycountry_convert.convert_continent_code_to_continent_name(continent_code)
    return continent


def clean_company_name(name: str, lowercase_to_orig_cname: dict) -> str:
    """
    Clean the company name. First try to find it in the map containing one-off mappings, then try to find it
    in the mapping of lowercase to original company names, and if both those fail, title case it
    :param name: lowercased company name
    :param lowercase_to_orig_cname: dict mapping lowercase to original-cased company names
    :return: cleaned company name
    """
    if not name:
        return None
    clean_name = name.strip()
    if clean_name in COMPANY_NAME_MAP:
        return COMPANY_NAME_MAP[clean_name]
    if clean_name in lowercase_to_orig_cname:
        return lowercase_to_orig_cname[clean_name]
    return clean_name.title()


def clean_aliases(aliases: list, lowercase_to_orig_cname: dict, orig_name: str = None) -> str:
    """
    Cleans company aliases and returns them as a string, semicolon-separated
    :param aliases: list of dicts containing an "alias" key
    :param lowercase_to_orig_cname: dict mapping lowercased company name to originally-cased company name
    :param orig_name: if not None, then a variant of the company name we should include as an alias
    :return: A semicolon-separated string of aliases
    """
    unique_aliases = set()
    for alias in aliases:
        cleaned_alias = clean_company_name(alias["alias"], lowercase_to_orig_cname)
        if not cleaned_alias:
            print(f"Null alias: {alias}")
            continue
        unique_aliases.add(cleaned_alias.strip("."))
    if orig_name is not None:
        unique_aliases.add(orig_name)
    sorted_aliases = sorted(list(unique_aliases))
    return None if len(aliases) == 0 else f"{'; '.join(sorted_aliases)}"


def format_links(link_text: list, url_prefix: str) -> (str, dict):
    """
    Generates links from a list of text that should be displayed for each link and a url prefix
    :param link_text: list of text to show in the UI and also add to the end of `url_prefix`
    :param url_prefix: a prefix shared by all links from this source
    :return: a dict containing text and url keys for each element of `link_text`
    """
    return [{"text": text, "url": f"{url_prefix}{text}"} for text in link_text]


def get_yearly_counts(counts: list, key: str, years: list = YEARS) -> (list, int):
    """
    Given a list of dicts containing year (`year`) and count (`key`) information, the name of the key to use,
    and a list of years to include in order, returns a tuple. The first element is a list of counts for each
    year in years, and the second element is the sum of the counts
    :param counts: a list of dicts containing year (`year`) and count (`key`) information
    :param key: the key in the `counts` dicts that contains the yearly count
    :param years: a list of years to write counts for
    :return: a tuple containing a list of counts for each year in years, and the sum of the counts over all years
    (including those outside `years`)
    """
    if not counts:
        return [0 for _ in years], 0
    year_key = "priority_year" if "priority_year" in counts[0] else "year"
    counts_by_year = {p[year_key]: p[key] for p in counts}
    yearly_counts = [0 if y not in counts_by_year else counts_by_year[y] for y in years]
    return yearly_counts, sum(yearly_counts)


def get_top_n_list(entities: list, count_key: str, n: int = 10) -> list:
    """
    Sort entries by count_key, descending, and return the top n
    :param entities: List of dicts corresponding to counts of some entity
    :param count_key: Key within entity elements containing field that should be used to sort
    :param n: Number of entities to return
    :return: Top ten entities
    """
    entities.sort(key=lambda e: e[count_key], reverse=True)
    return entities[:n]


def clean_crunchbase_elt(cb: dict) -> dict:
    """
    Cleans up a single element of crunchbase metadata so it matches the format of other lists of links,
    with `text` mapped to the text to display in the ui and `url` mapped to the text that should be linked
    :param cb:
    :return:
    """
    url = cb.get("crunchbase_url") if cb.get("crunchbase_url") else None
    url = CRUNCHBASE_URL_OVERRIDE.get(url, url)
    return {
        "text": cb["crunchbase_uuid"],
        "url": url
    }


def clean_crunchbase(crunchbase_meta) -> list:
    """
    Cleans up a single element or a list of crunchbase metadata so it matches the format of other lists of links,
    with `text` mapped to the text to display in the ui and `url` mapped to the text that should be linked
    :param cb: list of raw crunchbase metadata, or a dict containing one element of metadata
    :return: list of cleaned crunchbase metadata, or a dict containing cleaned crunchbase metadata
    """
    if type(crunchbase_meta) == dict:
        return clean_crunchbase_elt(crunchbase_meta)
    return [clean_crunchbase_elt(cb) for cb in crunchbase_meta]


def clean_misc_fields(js: dict, refresh_images: bool, lowercase_to_orig_cname: dict, market_key_to_link: dict) -> None:
    """
    Clean various PARAT fields that don't fit into another category
    :param js: A dict of data corresponding to an individual PARAT record
    :param refresh_images: if true, will re-download images from crunchbase
    :param lowercase_to_orig_cname: dict mapping lowercase company name to original case
    :param market_key_to_link: dict mapping exchange:ticker to google finance link
    :return: None (mutates js)
    """
    orig_company_name = js["name"]
    js["name"] = clean_company_name(orig_company_name, lowercase_to_orig_cname)
    if not js["name"]:
        print(f"No name for {js['cset_id']}")
    js["country"] = clean_country(js["country"])
    js["continent"] = get_continent(js["country"])
    js["local_logo"] = retrieve_image(js.pop("logo_url"), orig_company_name, refresh_images)
    js["aliases"] = clean_aliases(js.pop("aliases"), lowercase_to_orig_cname,
                                  orig_company_name if orig_company_name != js["name"].lower() else None)
    js["stage"] = js["stage"] if js["stage"] else "Unknown"
    js["permid_links"] = format_links(js.pop("permid"), "https://permid.org/1-")
    js["parent_info"] = clean_parent(js.pop("parent"), lowercase_to_orig_cname)
    js["agg_child_info"] = clean_children(js.pop("children"), lowercase_to_orig_cname)
    js["unagg_child_info"] = clean_children(js.pop("non_agg_children"), lowercase_to_orig_cname)
    market = clean_market(js.pop("market"), market_key_to_link)
    js["market_filt"] = [m for m in market if m["text"].split(":")[0] in FILT_EXCHANGES]
    js["market_full"] = market
    js["website"] = clean_link(js["website"])
    js["crunchbase_description"] = js.pop("short_description")
    js["crunchbase"] = clean_crunchbase(js["crunchbase"])
    js["child_crunchbase"] = clean_crunchbase(js["child_crunchbase"])
    group_keys_to_names = {
        "sp500": "in_sandp_500",
        "global500": "in_fortune_global_500"
    }
    js["groups"] = {k: js.pop(v, False) for k, v in group_keys_to_names.items()}
    js.pop("grid")


def get_top_10_lists(js: dict) -> None:
    """
    Filter count lists to top 10 elements
    :param js: A dict of data corresponding to an individual PARAT record
    :return: None (mutates js)
    """
    js["fields"] = get_top_n_list(js.pop("fields"), "field_count")
    js["clusters"] = get_top_n_list(js.pop("clusters"), "cluster_count")
    js["company_references"] = get_top_n_list(js.pop("company_references"), "referenced_count")
    js["tasks"] = get_top_n_list(js.pop("tasks"), "task_count")
    js["methods"] = get_top_n_list(js.pop("methods"), "method_count")


def add_patent_tables(patents: dict) -> None:
    """
    Add a key to each patent type's metadata containing the table name if the patent type should be displayed
    in a table, otherwise None
    :param patents: dict mapping patents to their metadata
    :return: None (mutates `patents`)
    """
    applications = [k for k in patents if k in APPLICATION_PATENT_CATEGORIES]
    industries = [k for k in patents if k in INDUSTRY_PATENT_CATEGORIES]
    top_5_applications = sorted(applications, key=lambda k: patents[k]["total"], reverse=True)[:5]
    top_5_industries = sorted(industries, key=lambda k: patents[k]["total"], reverse=True)[:5]
    for patent_key in patents:
        table = None
        if patent_key in top_5_applications:
            table = "application"
        elif patent_key in top_5_industries:
            table = "industry"
        patents[patent_key]["table"] = table


def get_category_counts(js: dict) -> None:
    """
    Reformat yearly and count-across-all-years data
    :param js: A dict of data corresponding to an individual PARAT record
    :return: None (mutates js)
    """
    articles = {}
    ### Reformat publication-related metrics
    for machine_name, orig_key, count_key, is_top_research in [
        ["all_publications", "all_pubs_by_year", "all_pubs", False],
        ["ai_publications", "ai_pubs_by_year", "ai_pubs", False],
        ["ai_pubs_top_conf", "ai_pubs_in_top_conferences_by_year", "ai_pubs_in_top_conferences", False],
        ["citation_counts", "citation_count_by_year", "citation_count", False],
        ["cv_pubs", "cv_pubs_by_year", "cv_pubs", True],
        ["nlp_pubs", "nlp_pubs_by_year", "nlp_pubs", True],
        ["robotics_pubs", "robotics_pubs_by_year", "robotics_pubs", True],
    ]:
        counts, total = get_yearly_counts(js.pop(orig_key), count_key)
        articles[machine_name] = {
            "counts": counts,
            "total": total,
            "isTopResearch": is_top_research
        }

    for year_idx in range(len(YEARS)):
        # assert js["yearly_all_publications"][year_idx] >= js["yearly_ai_publications"][year_idx]
        if articles["all_publications"]["counts"][year_idx] < articles["ai_publications"]["counts"][year_idx]:
            print(f"Mismatched publication counts for {js['cset_id']}")
    js[ARTICLE_METRICS] = articles

    ### Reformat patent-related metrics
    counts, total = get_yearly_counts(js.pop("ai_patents_by_year"), "ai_patents")
    patents = {
        "ai_patents": {
            "counts": counts,
            "total": total,
        }
    }
    # turn the row's keys into a new object to avoid "dictionary changed size during iteration"
    keys = list(js.keys())
    for k in keys:
        if "_pats" not in k:
            continue
        field_name = k.replace("_pats_by_year", "").replace("_pats", "")
        if ((field_name not in INDUSTRY_PATENT_CATEGORIES) and (field_name not in APPLICATION_PATENT_CATEGORIES)) or k.endswith("_pats"):
            js.pop(k)
        elif k.endswith("_pats_by_year"):
            counts, total = get_yearly_counts(js.pop(k), field_name+"_pats")
            patents[field_name] = {
                "counts": counts,
                "total": total,
            }
    add_patent_tables(patents)
    js[PATENT_METRICS] = patents

    ### Reformat other metrics
    other_metrics = {}
    for metric in ["tt1_jobs", "ai_jobs"]:
        other_metrics[metric] = {
            "counts": None,
            "total": js.pop(metric)
        }
    js[OTHER_METRICS] = other_metrics

    for redundant_count in ["ai_pubs", "cv_pubs", "nlp_pubs", "robotics_pubs", "ai_pubs_in_top_conferences",
                            "all_pubs", "ai_patents"]:
        js.pop(redundant_count)


def clean_row(row: str, refresh_images: bool, lowercase_to_orig_cname: dict, market_key_to_link: dict) -> dict:
    """
    Given a row from a jsonl, reformat its elements into the form needed by the PARAT javascript
    :param row: jsonl line containing company metadata
    :param refresh_images: if true, will re-download images from crunchbase
    :param lowercase_to_orig_cname: dict mapping lowercase company name to original case
    :param market_key_to_link: dict mapping exchange:ticker to google finance link
    :return: dict of company metadata
    """
    js = json.loads(row)
    clean_misc_fields(js, refresh_images, lowercase_to_orig_cname, market_key_to_link)
    get_top_10_lists(js)
    get_category_counts(js)
    return js


def clean_link(link: str) -> str:
    """
    Prepend https:// to links that don't start with http
    :param link: link to clean
    :return: link with https:// prepended
    """
    if link and not link.startswith("http"):
        return "https://" + link
    return link


def clean(refresh_images: bool) -> dict:
    """
    Reads and cleans the raw data from the local cache
    :param refresh_images: if true, will re-download all the company logos from crunchbase; don't call with true
    unless necessary
    :return: Return company-like metadata for groups
    """
    rows = []
    lowercase_to_orig_cname = {}
    with open(ORIG_NAMES_FI) as f:
        for line in f:
            js = json.loads(line)
            lowercase_to_orig_cname[js["lowercase_name"]] = js["orig_name"]
    market_key_to_link = {}
    with open(EXCHANGE_LINK_FI) as f:
        for line in f:
            js = json.loads(line)
            market_key_to_link[js["market_key"].upper()] = js["link"] if js["link"] else None
    with open(RAW_DATA_FI) as f:
        for row in f:
            rows.append(clean_row(row, refresh_images, lowercase_to_orig_cname, market_key_to_link))
    add_supplemental_descriptions(rows)
    add_ranks(rows)
    company_rows, group_data = [], {}
    for row in rows:
        # The final implementation will be more like the below, but spoofing this for now
        # if row["name"] in GROUP_NAMES_TO_KEYS:
        #     group_data[GROUP_NAMES_TO_KEYS[row["name"]]].append(row)
        # else:
        #     company_rows.append(row)
        company_rows.append(row)
        if row["name"] == "Google":
            sp500 = copy.deepcopy(row)
            sp500["name"] = "S&P 500"
            sp500["cset_id"] = 100500
            group_data["sp500"] = sp500
        elif row["name"] == "Microsoft":
            global500 = copy.deepcopy(row)
            global500["name"] = "Fortune Global 500"
            global500["cset_id"] = 100501
            group_data["global500"] = global500
    with open(os.path.join(WEB_SRC_DIR, "static_data", "data.js"), mode="w") as out:
        out.write(f"const company_data = {json.dumps(company_rows)};\n\nexport {{ company_data }};")
    return group_data


def update_overall_data(group_data: dict) -> None:
    """
    Generate top-level data that is not specific to a particular company or metric
    :param group_data: dict mapping group keys to company-like data for those groups
    :return: None
    """
    overall_data = {
        "years": YEARS,
        "startArticleYear": CURRENT_YEAR - 4,
        "endArticleYear": CURRENT_YEAR - 1,
        "startPatentYear": CURRENT_YEAR - 6,
        "endPatentYear": CURRENT_YEAR - 3,
        "groups": group_data
    }
    with open(os.path.join(WEB_SRC_DIR, "static_data", "overall_data.json"), mode="w") as out:
        out.write(json.dumps(overall_data))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh_raw", action="store_true", default=False,
                        help="Re-retrieve the raw data from BQ; if not specified will use local cache")
    parser.add_argument("--refresh_images", action="store_true", default=False,
                        help="Re-download the images; if not specified will use local cache")
    parser.add_argument("--refresh_market_links", action="store_true", default=False,
                        help="Re-retrieve the market links (takes ~1.5 hrs); if not specified will use local cache")
    args = parser.parse_args()

    if args.refresh_market_links and not args.refresh_raw:
        print("You must specify --refresh_raw if you want to refresh the market links")
        exit(0)

    if args.refresh_raw:
        retrieve_raw(args.refresh_market_links)
    group_data = clean(args.refresh_images)
    update_overall_data(group_data)
