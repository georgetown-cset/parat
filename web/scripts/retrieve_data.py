import argparse
import chardet
import csv
import json
import os
import pycountry
import pycountry_convert
import pycld2
import re
import requests
import tempfile
import time
import zipfile

from PIL import Image
from collections import OrderedDict
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from google.cloud import bigquery
from google.cloud import translate_v3beta1 as translate
from io import BytesIO
from slugify import slugify
from tqdm import tqdm

"""
Retrieves and reformats raw data for consumption by javascript
"""

### CONSTANTS ###

RAW_DATA_DIR = "raw_data"
WEB_SRC_DIR = os.path.join("gui-v2", "src")
IMAGE_DIR = os.path.join(WEB_SRC_DIR, "images")
TRANSLATION_CLIENT = translate.TranslationServiceClient()

# Local cache of raw data (ai_companies_visualization.visualization_data)
RAW_DATA_FI = os.path.join(RAW_DATA_DIR, "data.jsonl")
# Local cache of ai_companies_visualization.original_company_names; used to map lowercased versions of
# company names back to original casing, where available
ORIG_NAMES_FI = os.path.join(RAW_DATA_DIR, "company_names.jsonl")
# Cache of links to Google Finance page
EXCHANGE_LINK_FI = os.path.join(RAW_DATA_DIR, "exchange_links.jsonl")
# Cache of PERMID sectors
SECTOR_FI = os.path.join(RAW_DATA_DIR, "sectors.jsonl")
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
    "captricity": "Vidado",
    "Alphabet": "Alphabet (including Google)"
}
REVERSE_COMPANY_NAME_MAP = {v: k for k, v in COMPANY_NAME_MAP.items()}
# Maps broken links from crunchbase to correct ones
CRUNCHBASE_URL_OVERRIDE = {
    ("https://www.crunchbase.com/organization/embodied-intelligence?utm_source=crunchbase&utm_medium=export&"
     "utm_campaign=odm_csv"): "https://www.crunchbase.com/organization/covariant"
}
# Exchanges to display in the UI, selected by Zach
FILT_EXCHANGES = {"NYSE", "NASDAQ", "HKG", "SSH", "SSE", "SZSE"}

APPLICATION_PATENT_CATEGORIES = {"Language_Processing", "Speech_Processing", "Knowledge_Representation", "Planning_and_Scheduling", "Control", "Distributed_AI", "Robotics", "Computer_Vision", "Analytics_and_Algorithms", "Measuring_and_Testing"}
INDUSTRY_PATENT_CATEGORIES = {"Physical_Sciences_and_Engineering", "Life_Sciences", "Security__eg_cybersecurity", "Transportation", "Industrial_and_Manufacturing", "Education", "Document_Mgt_and_Publishing", "Military", "Agricultural", "Computing_in_Government", "Personal_Devices_and_Computing", "Banking_and_Finance", "Telecommunications", "Networks__eg_social_IOT_etc", "Business", "Energy_Management", "Entertainment", "Nanotechnology", "Semiconductors"}

ARTICLE_METRICS = "articles"
PATENT_METRICS = "patents"
OTHER_METRICS = "other_metrics"
METRIC_LISTS = [ARTICLE_METRICS, PATENT_METRICS, OTHER_METRICS]

_curr_time = datetime.now()
CURRENT_YEAR = _curr_time.year - 1
ARTICLE_OFFSET = 2
PATENT_OFFSET = 3
GROWTH_INTERVAL = 3
END_ARTICLE_YEAR = CURRENT_YEAR - ARTICLE_OFFSET
END_PATENT_YEAR = CURRENT_YEAR - PATENT_OFFSET
YEARS = list(range(CURRENT_YEAR - 10, CURRENT_YEAR + 1))

# Used (along with a check that we never actually meet or exceed this number with legitimate CSET ids)
# when creating fake CSET ids for groups
GROUP_OFFSET = 1_000_000

_middle_east = ["Egypt", "Iran", "Turkey", "Iraq", "Saudi Arabia", "Yemen", "Syria", "Jordan",
               "United Arab Emirates", "Israel", "Lebanon", "Palestine", "Oman", "Kuwait", "Qatar", "Bahrain"]
A2_MIDDLE_EAST = [pycountry_convert.country_name_to_country_alpha2(c).lower() for c in _middle_east]
assert not any([c is None for c in A2_MIDDLE_EAST]), f"Null country in {A2_MIDDLE_EAST}"

GROUP_ID_TO_NAME = {
    "sp500": "S&P 500",
    "globalBigTech": "Global Big Tech",
    "genAI": "GenAI Contenders"
}

CORE_COLUMN_MAPPING = OrderedDict([
    ("Name", lambda row: row["name"]),
    ("ID", lambda row: row["cset_id"]),
    ("Country", lambda row: row["country"]),
    ("Website", lambda row: row["website"]),
    ("Groups", lambda row: ", ".join([GROUP_ID_TO_NAME[group_name] for group_name, in_group in row["groups"].items() if in_group])),
    ("Aggregated subsidiaries", lambda row: row["agg_child_info"]),
    ("Region", lambda row: row["continent"]),
    ("Stage", lambda row: row["stage"]),
    ("Sector", lambda row: row["sector"]),
    ("Description", lambda row: row["description"]),
    ("Description source", lambda row: row["description_source"]),
    ("Description link", lambda row: row["description_link"]),
    ("Description date", lambda row: row["description_retrieval_date"]),
    ("Publications: AI publications", lambda row: row["articles"]["ai_publications"]["total"]),
    ("Publications: Recent AI publication growth", lambda row: row["articles"]["ai_publications_growth"]["total"]),
    ("Publications: AI publication percentage", lambda row: row["articles"]["ai_pubs_percent"]["total"]),
    ("Publications: AI publications in top conferences", lambda row: row["articles"]["ai_pubs_top_conf"]["total"]),
    ("Publications: Citations to AI research", lambda row: row["articles"]["ai_citation_counts"]["total"]),
    ("Publications: CV publications", lambda row: row["articles"]["cv_publications"]["total"]),
    ("Publications: NLP publications", lambda row: row["articles"]["nlp_publications"]["total"]),
    ("Publications: Robotics publications", lambda row: row["articles"]["robotics_publications"]["total"]),
    ("Publications: Total publications", lambda row: row["articles"]["all_publications"]["total"]),
    ("Patents: AI patents", lambda row: row["patents"]["ai_patents"]["total"]),
    ("Patents: AI patents: recent growth", lambda row: row["patents"]["ai_patents_growth"]["total"]),
    ("Patents: AI patent percentage", lambda row: row["patents"]["ai_patents_percent"]["total"]),
    ("Patents: Granted AI patents", lambda row: row["patents"]["ai_patents_grants"]["total"]),
    ("Patents: Total patents", lambda row: row["patents"]["all_patents"]["total"]),
    ("Patents: AI use cases: Agriculture", lambda row: row["patents"]["Agricultural"]["total"]),
    ("Patents: AI use cases: Banking and finance", lambda row: row["patents"]["Banking_and_Finance"]["total"]),
    ("Patents: AI use cases: Business", lambda row: row["patents"]["Business"]["total"]),
    ("Patents: AI use cases: Computing in government", lambda row: row["patents"]["Computing_in_Government"]["total"]),
    ("Patents: AI use cases: Document management and publishing", lambda row: row["patents"]["Document_Mgt_and_Publishing"]["total"]),
    ("Patents: AI use cases: Education", lambda row: row["patents"]["Education"]["total"]),
    ("Patents: AI use cases: Energy", lambda row: row["patents"]["Energy_Management"]["total"]),
    ("Patents: AI use cases: Entertainment", lambda row: row["patents"]["Entertainment"]["total"]),
    ("Patents: AI use cases: Industry and manufacturing", lambda row: row["patents"]["Industrial_and_Manufacturing"]["total"]),
    ("Patents: AI use cases: Life sciences", lambda row: row["patents"]["Life_Sciences"]["total"]),
    ("Patents: AI use cases: Military", lambda row: row["patents"]["Military"]["total"]),
    ("Patents: AI use cases: Nanotechnology", lambda row: row["patents"]["Nanotechnology"]["total"]),
    ("Patents: AI use cases: Networking", lambda row: row["patents"]["Networks__eg_social_IOT_etc"]["total"]),
    ("Patents: AI use cases: Personal devices and computing", lambda row: row["patents"]["Personal_Devices_and_Computing"]["total"]),
    ("Patents: AI use cases: Physical sciences and engineering", lambda row: row["patents"]["Physical_Sciences_and_Engineering"]["total"]),
    ("Patents: AI use cases: Security", lambda row: row["patents"]["Security__eg_cybersecurity"]["total"]),
    ("Patents: AI use cases: Semiconductors", lambda row: row["patents"]["Semiconductors"]["total"]),
    ("Patents: AI use cases: Telecommunications", lambda row: row["patents"]["Telecommunications"]["total"]),
    ("Patents: AI use cases: Transportation", lambda row: row["patents"]["Transportation"]["total"]),
    ("Patents: AI applications and techniques: Analytics and algorithms", lambda row: row["patents"]["Analytics_and_Algorithms"]["total"]),
    ("Patents: AI applications and techniques: Computer vision", lambda row: row["patents"]["Computer_Vision"]["total"]),
    ("Patents: AI applications and techniques: Control", lambda row: row["patents"]["Control"]["total"]),
    ("Patents: AI applications and techniques: Distributed AI", lambda row: row["patents"]["Distributed_AI"]["total"]),
    ("Patents: AI applications and techniques: Knowledge representation", lambda row: row["patents"]["Knowledge_Representation"]["total"]),
    ("Patents: AI applications and techniques: Language processing", lambda row: row["patents"]["Language_Processing"]["total"]),
    ("Patents: AI applications and techniques: Measuring and testing", lambda row: row["patents"]["Measuring_and_Testing"]["total"]),
    ("Patents: AI applications and techniques: Planning and scheduling", lambda row: row["patents"]["Planning_and_Scheduling"]["total"]),
    ("Patents: AI applications and techniques: Robotics", lambda row: row["patents"]["Robotics"]["total"]),
    ("Patents: AI applications and techniques: Speech processing", lambda row: row["patents"]["Speech_Processing"]["total"]),
    ("Workforce: AI workers", lambda row: row["other_metrics"]["ai_jobs"]["total"]),
    ("Workforce: Tech Tier 1 workers", lambda row: row["other_metrics"]["tt1_jobs"]["total"]),
])

### END CONSTANTS ###


def get_exchange_link(market_key: str) -> dict:
    """
    Given a exchange:ticker market key, check google finance links for ticker:exchange link
    :param market_key: exchange:ticker
    :return: A dict mapping market_key to the input market_key and link to the link, if successfully found, else None
    """
    exchange, ticker = [e.strip() for e in market_key.strip(":").split(":")]
    if exchange not in FILT_EXCHANGES:
        return None
    gf_link = f"https://www.google.com/finance/quote/{ticker}:{exchange}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:87.0) Gecko/20100101 Firefox/87.0"
    }
    time.sleep(1)
    r = requests.get(gf_link, headers=headers)
    return {"market_key": market_key, "link": None if "No results found" in r.text else gf_link}


def get_permid_sector(permid: str) -> str:
    """
    Get first permid sector available in permids for a PARAT company
    :param permid: Company's permid
    :return: First business sector from PERMID, or "Unknown" if we couldn't find it
    """
    null_result = "Unknown"
    if not permid:
        return null_result
    access_token = os.environ.get("PERMID_API_KEY")
    sector_key = "Primary Business Sector"
    if not access_token:
        raise ValueError("Please specify your permid key using an environment variable called PERMID_API_KEY")
    resp = requests.get(f"https://permid.org/api/mdaas/getEntityById/{permid}?access-token={access_token}")
    if resp.status_code != 200:
        print(f"Unexpected status code {resp.status_code} for {permid}")
    metadata = resp.json()
    sector = metadata.get(sector_key)
    if sector:
        return sector[0]
    return null_result


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
    lower_name_to_id = {}
    with open(RAW_DATA_FI, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.all_visualization_data"):
            dict_row = {col: row[col] for col in row.keys()}
            if not row["name"]:
                print(f"{row['cset_id']} missing name")
                continue
            desc_date = dict_row.get("description_retrieval_date")
            dict_row["description_retrieval_date"] = None if not desc_date else desc_date.strftime("%Y-%m-%d")
            out.write(json.dumps(dict_row)+"\n")
            market_info = market_info.union([m["exchange"]+":"+m["ticker"] for m in dict_row["market"]])
            lower_name_to_id[dict_row["name"].lower()] = dict_row["cset_id"]
    print("retrieving original company names")
    id_and_orig_name = []
    with open(ORIG_NAMES_FI, mode="w") as out:
        for row in client.list_rows("ai_companies_visualization.original_company_names"):
            name = row["name"]
            if name is None:
                continue
            row = {"orig_name": name, "lowercase_name": name.lower()}
            out.write(json.dumps(row)+"\n")
            if name.lower() in lower_name_to_id:
                id_and_orig_name.append({
                    "cset_id": lower_name_to_id[name.lower()],
                    "name": COMPANY_NAME_MAP.get(name, name)
                })
    with open(os.path.join(WEB_SRC_DIR, "data", "companies.json"), mode="w") as web_out:
        web_out.write(json.dumps(id_and_orig_name))
    if get_links:
        print("retrieving market links")
        with open(EXCHANGE_LINK_FI, mode="w") as out:
            for mi in tqdm(market_info):
                mi_row = get_exchange_link(mi)
                if mi_row:
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
    # Override apple logo to use manually corrected svg if present
    if (company_name == "apple") and os.path.exists(os.path.join(IMAGE_DIR, "apple.svg")):
        return "apple.svg"
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
                      for parent in parents if parent["parent_name"]]
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
        if not m["exchange"].upper() in FILT_EXCHANGES:
            continue
        market_key = f"{m['exchange'].upper()}:{m['ticker'].upper()}"
        ref_market_info.append({
            "text": market_key,
            "url": market_key_to_link.get(market_key)
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
        row_and_key_groups = [(rows, "rank"),
                               ([r for r in rows if r.get("groups", {}).get("sp500")], "sp500_rank"),
                               ([r for r in rows if r.get("groups", {}).get("globalBigTech")], "globalBigTech_rank"),
                               ([r for r in rows if r.get("groups", {}).get("genAI")], "genAI_rank")]
        for filtered_rows, rank_key in row_and_key_groups:
            for row in filtered_rows:
                for metric in row.get(metric_list_name, {}):
                    all_metrics.add(metric)
            for metric in sorted(list(all_metrics)):
                curr_rank = 0
                curr_value = 100000000000
                filtered_rows.sort(key=lambda r: -1*get_metric_value(r, metric_list_name, metric))
                for idx, row in enumerate(filtered_rows):
                    metric_value = get_metric_value(row, metric_list_name, metric)
                    if metric_value < curr_value:
                        curr_rank = idx+1
                        curr_value = metric_value
                    if metric not in row[metric_list_name]:
                        row[metric_list_name][metric] = {"total": metric_value}
                    row[metric_list_name][metric].update({
                        rank_key: curr_rank
                    })


def get_translation(desc: str) -> str:
    """
    Get translation of non-english company descriptions. Returns None if `desc` cannot be translated or if it is
    English already according to pycld2
    :param desc: Description form any language.
    :return: translation of `desc` or None
    """
    parent = "projects/gcp-cset-projects/locations/global"
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
        response = TRANSLATION_CLIENT.translate_text(request = {
            "parent": parent,
            "contents": [desc],
            "mime_type": "text/plain",
            "target_language_code": "en"
        })
        translation = response.translations[0].translated_text.strip()
        return translation
    return desc


def clean_descriptions(row: dict) -> None:
    """
    Clean and translate descriptions of companies
    :param row: row of company metadata
    :return: None; mutates `row`
    """
    original_description = row["description"]
    if row["description_source"] == "wikipedia":
        row["description"] = clean_wiki_description(original_description)
    elif row["description_source"] == "company":
        row["description"] = get_translation(original_description)
    row["description_link"] = clean_link(row["description_link"])


def get_growth(yearly_counts: list, is_patents: bool = False) -> float:
    """
    Adds growth metrics based on yearly counts
    :param yearly_counts: list of yearly counts of some metric
    :param is_patents: true if counts are for patents, false otherwise
    :return: None; mutates rows
    """
    offset = PATENT_OFFSET if is_patents else ARTICLE_OFFSET
    interval_values = yearly_counts[-(GROWTH_INTERVAL+1+offset):-1*offset]
    num_zero_years = sum([value == 0 for value in interval_values[:-1]])
    if num_zero_years == GROWTH_INTERVAL:
        return None
    total_percentage_changes = sum([100*(interval_values[i+1]-interval_values[i])/interval_values[i]
                                    for i in range(GROWTH_INTERVAL) if interval_values[i] > 0])
    return total_percentage_changes/(GROWTH_INTERVAL-num_zero_years)


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
    # Converting everything to alpha2 as a hacky way of normalizing input countries
    alpha2 = pycountry_convert.country_name_to_country_alpha2(country)
    if alpha2.lower() in A2_MIDDLE_EAST:
        return "Middle East"
    else:
        continent_code = pycountry_convert.country_alpha2_to_continent_code(alpha2)
        continent = pycountry_convert.convert_continent_code_to_continent_name(continent_code)
        return continent


def clean_company_name(name: str, lowercase_to_orig_cname: dict) -> str:
    """
    Clean the company name. First try to find it in the map containing one-off mappings, then try to find it
    in the mapping of lowercase to original company names, and if both those fail, return the original name
    :param name: lowercased company name
    :param lowercase_to_orig_cname: dict mapping lowercase to original-cased company names
    :return: cleaned company name
    """
    if not name:
        return None
    clean_name = name.strip()
    if clean_name in COMPANY_NAME_MAP:
        return COMPANY_NAME_MAP[clean_name]
    if clean_name.lower() in lowercase_to_orig_cname:
        return lowercase_to_orig_cname[clean_name.lower()]
    return clean_name


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


def get_permid_links(top_permid: str, child_permids: list) -> list:
    """
    Genrerate list of permid links from a row's permid data
    :param row: row of data
    :return: None (mutates row)
    """
    if not top_permid:
        return None
    permids = [top_permid]+child_permids
    permid_links = []
    prefix = "https://permid.org/1-"
    for permid in permids:
        link = f"{prefix}{permid}" if prefix not in permid else permid
        permid_links.append({"text": permid.replace(prefix, ""), "url": link})
    return permid_links


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
    js["permid_links"] = get_permid_links(js.get("permid"), js.pop("child_permid", []))
    js["parent_info"] = clean_parent(js.pop("parent"), lowercase_to_orig_cname)
    js["agg_child_info"] = clean_children(js.pop("children"), lowercase_to_orig_cname)
    js["unagg_child_info"] = clean_children(js.pop("non_agg_children"), lowercase_to_orig_cname)
    js["market"] = clean_market(js.pop("market"), market_key_to_link)
    js["website"] = clean_link(js["website"])
    js.pop("short_description")
    js["crunchbase"] = clean_crunchbase(js["crunchbase"])
    js["child_crunchbase"] = clean_crunchbase(js["child_crunchbase"])
    group_keys_to_names = {
        "sp500": "in_sandp_500",
        "globalBigTech": "in_global_big_tech",
        "genAI": "in_gen_ai"
    }
    js["groups"] = {k: js.pop(v, False) for k, v in group_keys_to_names.items()}


def get_top_10_lists(js: dict) -> None:
    """
    Filter count lists to top 10 elements
    :param js: A dict of data corresponding to an individual PARAT record
    :return: None (mutates js)
    """
    js["company_references"] = get_top_n_list(js.pop("company_references"), "referenced_count")


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
    for machine_name, orig_key, is_top_research in [
        ["all_publications", "all_pubs_by_year", False],
        ["ai_publications", "ai_pubs_by_year", False],
        ["highly_cited_ai_pubs", "highly_cited_ai_pubs_by_year", False],
        ["ai_pubs_top_conf", "ai_pubs_in_top_conferences_by_year", False],
        ["ai_citation_counts", "ai_citation_count_by_year", False],
        ["cv_citation_counts", "cv_citation_count_by_year", False],
        ["nlp_citation_counts", "nlp_citation_count_by_year", False],
        ["robotics_citation_counts", "robotics_citation_count_by_year", False],
        ["cv_publications", "cv_pubs_by_year", True],
        ["nlp_publications", "nlp_pubs_by_year", True],
        ["robotics_publications", "robotics_pubs_by_year", True],
    ]:
        counts, total = get_yearly_counts(js.pop(orig_key), "num_papers")
        articles[machine_name] = {
            "counts": counts,
            "total": total,
            "isTopResearch": is_top_research
        }
        if machine_name == "ai_publications":
            articles[machine_name+"_growth"] = {
                "counts": [],
                "total": get_growth(counts),
                "isTopResearch": is_top_research
            }
        elif machine_name in ["cv_publications", "nlp_publications", "robotics_publications"]:
            growth = get_growth(counts, False)
            articles[machine_name]["growth"] = None if growth is None else round(growth, 2)

    ai_publications = articles["ai_publications"]
    ai_citations = articles["ai_citation_counts"]
    articles["ai_citations_per_article"] = {
        "counts": [0 if num_art == 0 else num_cit/num_art for num_art, num_cit in
                    zip(ai_publications["counts"], ai_citations["counts"])],
        "total": 0 if ai_publications["total"] == 0 else
                        ai_citations["total"]/ai_publications["total"],
        "isTopResearch": False
    }
    for classifier in ["cv", "nlp", "robotics"]:
        citations_per_article = 0
        if articles[f"{classifier}_publications"]["total"] != 0:
            total_citations = articles[f"{classifier}_citation_counts"]["total"]
            total_publications = articles[f"{classifier}_publications"]["total"]
            citations_per_article = total_citations/total_publications
        articles[f"{classifier}_publications"]["citations_per_article"] = citations_per_article

    for year_idx in range(len(YEARS)):
        # assert js["yearly_all_publications"][year_idx] >= js["yearly_ai_publications"][year_idx]
        if articles["all_publications"]["counts"][year_idx] < articles["ai_publications"]["counts"][year_idx]:
            print(f"Mismatched publication counts for {js['cset_id']}")
    js[ARTICLE_METRICS] = articles

    ### Reformat patent-related metrics
    patent_count_key = "num_patents"
    ai_counts, ai_total = get_yearly_counts(js.pop("ai_patents_by_year"), patent_count_key)
    all_counts, all_total = get_yearly_counts(js.pop("all_patents_by_year"), patent_count_key)
    patents = {
        "ai_patents": {
            "counts": ai_counts,
            "total": ai_total,
        },
        "ai_patents_growth": {
            "counts": [],
            "total": get_growth(ai_counts, is_patents=True)
        },
        "ai_patents_grants": {
            "counts": [],
            "total": get_yearly_counts(js.pop("ai_patents_grants_by_year", {}), patent_count_key)[1],
        },
        "all_patents": {
            "counts": all_counts,
            "total": all_total
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
            counts, total = get_yearly_counts(js.pop(k), patent_count_key)
            growth = get_growth(counts, True)
            patents[field_name] = {
                "counts": counts,
                "total": total,
                "growth": None if growth is None else round(growth, 2)
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
                            "all_pubs", "ai_patents", "all_patents"]:
        js.pop(redundant_count)


def add_sectors(rows: list, refresh: bool) -> None:
    """
    Adds sector to each row, updating sectors from PERMID if needed. Removes the "permid" key from the row which
    is no longer needed after this function runs
    :param rows: List of rows of company metadata
    :param refresh: If true, will refresh sectors from PERMID
    :return: None (mutates rows)
    """
    if refresh:
        sectors = {}
        for row in rows:
            sector = get_permid_sector(row.pop("permid"))
            row["sector"] = sector
            sectors[row["cset_id"]] = sector
        with open(SECTOR_FI, mode="w") as f:
            f.write(json.dumps(sectors))
    else:
        with open(SECTOR_FI) as f:
            sectors = json.loads(f.read())
        for row in rows:
            cset_id = str(row["cset_id"])
            row["sector"] = sectors[cset_id]
            row.pop("permid")


def get_field_percentage(js: dict, parent_key: str, background_key: str, field_key: str) -> float:
    """
    Add percentage of publications/patenting in AI vs background
    :param js: Row we want to add percentage to
    :param parent_key: Overall category (article, patent)
    :param background_key: Key containing total to be used in denominator of percentage calculation
    :param field_key: Key containing total to be used in numerator of percentage calculation
    :return: Percentage of `field_key` in background
    """
    background_total = js[parent_key][background_key]["total"]
    field_total = js[parent_key][field_key]["total"]
    pct = 0 if not background_total else round(100*field_total/background_total, 1)
    return pct


def add_derived_metrics(js: dict, end_article_year: int, end_patent_year: int) -> None:
    """
    Add derived metrics
    :param js: Row we want to augment with more metrics
    :param end_article_year: End year to use for article metrics
    :param end_patent_year: End year to use for patent metrics
    :return: None (mutates js)
    """
    # AI publication percentage
    ai_pubs_pct = get_field_percentage(js, "articles", "all_publications", "ai_publications")
    js["articles"]["ai_pubs_percent"] = {"counts": [], "total": ai_pubs_pct, "isTopResearch": False}

    # AI patenting percentage
    ai_patents_pct = get_field_percentage(js, "patents", "all_patents", "ai_patents")
    js["patents"]["ai_patents_percent"] = {"counts": [], "total": ai_patents_pct, "table": None}


def clean_row(row: str, refresh_images: bool, lowercase_to_orig_cname: dict, market_key_to_link: dict,
              end_article_year: int = END_ARTICLE_YEAR, end_patent_year: int = END_PATENT_YEAR) -> dict:
    """
    Given a row from a jsonl, reformat its elements into the form needed by the PARAT javascript
    :param row: jsonl line containing company metadata
    :param refresh_images: if true, will re-download images from crunchbase
    :param lowercase_to_orig_cname: dict mapping lowercase company name to original case
    :param market_key_to_link: dict mapping exchange:ticker to google finance link
    :param end_article_year: End year to use for derived article metrics
    :param end_patent_year: End year to use for derived patent metrics
    :return: dict of company metadata
    """
    js = json.loads(row)
    clean_misc_fields(js, refresh_images, lowercase_to_orig_cname, market_key_to_link)
    js.pop("tasks")
    js.pop("methods")
    js.pop("fields")
    js.pop("clusters")
    get_top_10_lists(js)
    get_category_counts(js)
    add_derived_metrics(js, end_article_year, end_patent_year)
    clean_descriptions(js)
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


def clean(refresh_images: bool, refresh_sectors: bool) -> dict:
    """
    Reads and cleans the raw data from the local cache
    :param refresh_images: if true, will re-download all the company logos from crunchbase; don't call with true
    unless necessary
    :param refresh_sectors: if true, will re-query the PERMID api for sector information for each company
    :return: Return a dict of metadata and rows needed to compute average metadata for groups and a list of metadata
    for each company
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
    add_sectors(rows, refresh_sectors)
    add_ranks(rows)
    company_rows = []
    raw_group_metadata = {
        "sp500": {
            "cset_id": GROUP_OFFSET+500,
            "rows": []
        },
        "globalBigTech": {
            "cset_id": GROUP_OFFSET+502,
            "rows": []
        },
        "genAI": {
            "cset_id": GROUP_OFFSET + 503,
            "rows": []
        },
    }
    for group_id in raw_group_metadata:
        raw_group_metadata[group_id]["name"] = GROUP_ID_TO_NAME[group_id]
    for row in rows:
        company_rows.append(row)
        assert row["cset_id"] < GROUP_OFFSET, \
            f"Congratulations! There are more than {GROUP_OFFSET-1} PARAT companies now and you need to update this code."
        for group_name in row["groups"]:
            if row["groups"][group_name]:
                raw_group_metadata[group_name]["rows"].append(row)
    with open(os.path.join(WEB_SRC_DIR, "static_data", "data.js"), mode="w") as out:
        out.write(f"const company_data = {json.dumps(company_rows)};\n\nexport {{ company_data }};")
    return raw_group_metadata, company_rows


def exp_round(num: float) -> int:
    """
    Round numbers the way we learned in school, with .5 rounding up
    :param num: number to round
    :return: rounded number
    """
    return int(Decimal(str(num)).quantize(Decimal(), rounding=ROUND_HALF_UP))


def get_average_group_data(raw_group_metadata: dict) -> dict:
    """
    Averages metrics across a group's companies
    :param raw_group_metadata: dict mapping group key to CSET id, name, and all rows belonging to that group
    :return: Dict mapping group key to CSET id, name, and average metrics across rows in the group
    """
    average_group_data = {}
    for group in raw_group_metadata:
        average_group_data[group] = {
            "cset_id": raw_group_metadata[group]["cset_id"],
            "name": raw_group_metadata[group]["name"],
            ARTICLE_METRICS: {},
            PATENT_METRICS: {},
            OTHER_METRICS: {}
        }
        rows = raw_group_metadata[group]["rows"]
        for category in [ARTICLE_METRICS, PATENT_METRICS, OTHER_METRICS]:
            has_counts = category != OTHER_METRICS
            metrics = rows[0][category].keys()
            for metric in metrics:
                total_metric_data = {}
                num_valid_totals = 0
                for row in rows:
                    if not total_metric_data:
                        # since we're computing a sum, we can just copy the values of the first row we see for the
                        # initial values
                        total_metric_data = row[category][metric]
                        num_valid_totals += 1
                    else:
                        total = row[category][metric]["total"]
                        if total is None:
                            continue
                        num_valid_totals += 1
                        total_metric_data["total"] += total
                        if has_counts:
                            for idx, yearly_value in enumerate(row[category][metric]["counts"]):
                                total_metric_data["counts"][idx] += yearly_value
                average_group_data[group][category][metric] = {
                    "total": exp_round(total_metric_data["total"]/num_valid_totals),
                    "counts": None if not has_counts else [exp_round(total/len(rows))
                                                           for total in total_metric_data["counts"]]
                }
    return average_group_data


def update_overall_data(group_data: dict) -> None:
    """
    Generate top-level data that is not specific to a particular company or metric
    :param group_data: dict mapping group keys to data we will use to compute average metadata for those groups
    :return: None
    """
    print("Calculating average metadata for company groups")
    average_group_data = get_average_group_data(group_data)
    overall_data = {
        "years": YEARS,
        "startArticleYear": CURRENT_YEAR - ARTICLE_OFFSET - GROWTH_INTERVAL,
        "endArticleYear": END_ARTICLE_YEAR,
        "startPatentYear": CURRENT_YEAR - PATENT_OFFSET - GROWTH_INTERVAL,
        "endPatentYear": END_PATENT_YEAR,
        "groups": average_group_data,
        "groupIdOffset": GROUP_OFFSET
    }
    with open(os.path.join(WEB_SRC_DIR, "static_data", "overall_data.json"), mode="w") as out:
        out.write(json.dumps(overall_data))


def write_query_to_csv(query: str, output_file: str, fieldnames: list) -> None:
    """
    Write results of a query to a csv
    :param query: BQ query to execute
    :param output_file: File where outputs should be written
    :param fieldnames: List of columns
    :return:
    """
    client = bigquery.Client()
    with open(output_file, mode="w") as out:
        writer = csv.DictWriter(out, fieldnames=fieldnames)
        writer.writeheader()
        rows = client.query_and_wait(query)
        for row in rows:
            dict_row = {col: row[col] for col in row.keys()}
            writer.writerow(dict_row)


def get_extra_org_meta() -> dict:
    """
    Retrieve "extra" metadata about an org that doesn't cleanly fit into another part of the data pull
    :return: dict mapping parat id to extra metadata
    """
    client = bigquery.Client()
    extra_meta = {}
    rows = client.query_and_wait("""
        SELECT
          COALESCE(legacy_cset_id, 4000+new_cset_id) as id,
          city,
          province_state
        FROM 
          parat_input.organizations
    """)
    for row in rows:
        extra_meta[row["id"]] = {
            "City": row["city"],
            "State/province": row["province_state"],
        }
    return extra_meta


def update_data_delivery(clean_company_rows: dict) -> None:
    """
    Updates data delivery for Zenodo
    :param group_data: list of clean metadata for each row
    :return: None
    """
    print("retrieving metadata")
    with tempfile.TemporaryDirectory() as td:
        core_file = "core.csv"
        ids_file = "id.csv"
        aliases_file = "alias.csv"
        ticker_file = "ticker.csv"
        extra_org_meta = get_extra_org_meta()
        with open(os.path.join(td, core_file), mode="w") as out:
            fieldnames = list(CORE_COLUMN_MAPPING.keys())+list(extra_org_meta[list(extra_org_meta.keys())[0]].keys())+["PARAT link"]
            writer = csv.DictWriter(out, fieldnames=fieldnames)
            writer.writeheader()
            for row in clean_company_rows:
                reformatted_row = {new_name: get(row) for new_name, get in CORE_COLUMN_MAPPING.items()}
                reformatted_row.update(extra_org_meta.get(reformatted_row["ID"], set()))
                slugified_name = slugify(reformatted_row["Name"].replace("/", "").replace("'", ""))
                reformatted_row["PARAT link"] = f"https://parat.eto.tech/company/{reformatted_row['ID']}-{slugified_name}"
                writer.writerow(reformatted_row)
        write_query_to_csv(
            """
            SELECT
              organizations.name as Name,
              COALESCE(legacy_cset_id, 4000+new_cset_id) as ID,
              external_id as Identifier,
              source as Type
            FROM parat_input.organizations 
            inner join parat_input.ids
            using(new_cset_id)
            """,
            os.path.join(td, ids_file),
            ["Name", "ID", "Identifier", "Type"]
        )
        write_query_to_csv(
            """
            SELECT
              organizations.name as Name,
              COALESCE(legacy_cset_id, 4000+new_cset_id) as ID,
              alias as Alias,
              alias_language as Language
            FROM parat_input.organizations 
            inner join parat_input.aliases
            using(new_cset_id)
            """,
            os.path.join(td, aliases_file),
            ["Name", "ID", "Alias", "Language"]
        )
        write_query_to_csv(
            f"""
            SELECT
              organizations.name as Name,
              COALESCE(legacy_cset_id, 4000+new_cset_id) as ID,
              ticker as Ticker,
              market as Exchange
            FROM parat_input.organizations 
            inner join parat_input.tickers
            using(new_cset_id)
            where market in ({", ".join([f'"{e}"' for e in FILT_EXCHANGES])})
            """,
            os.path.join(td, ticker_file),
            ["Name", "ID", "Ticker", "Exchange"]
        )
        download_name = f"parat_data_{datetime.now().strftime('%Y%m%d')}"
        with zipfile.ZipFile(f"{download_name}.zip", "w") as zip:
            for out_csv in [core_file, ids_file, aliases_file, ticker_file]:
                zip.write(os.path.join(td, out_csv), os.path.join(download_name, out_csv))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh_raw", action="store_true", default=False,
                        help="Re-retrieve the raw data from BQ; if not specified will use local cache")
    parser.add_argument("--refresh_images", action="store_true", default=False,
                        help="Re-download the images; if not specified will use local cache")
    parser.add_argument("--refresh_market_links", action="store_true", default=False,
                        help="Re-retrieve the market links (takes ~1.5 hrs); if not specified will use local cache")
    parser.add_argument("--refresh_sectors", action="store_true", default=False,
                        help="Retrieve sector information from PERMID API; requires API key available in "
                             "PERMID_API_KEY environment variable")
    args = parser.parse_args()

    if args.refresh_market_links and not args.refresh_raw:
        print("You must specify --refresh_raw if you want to refresh the market links")
        exit(0)
    if args.refresh_raw:
        retrieve_raw(args.refresh_market_links)
    group_data, clean_company_rows = clean(args.refresh_images, args.refresh_sectors)
    update_data_delivery(clean_company_rows)
    update_overall_data(group_data)
