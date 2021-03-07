import argparse
import json
import os
import pycountry
import requests

from PIL import Image
from google.cloud import bigquery
from io import BytesIO

raw_data_dir = "raw_data"
raw_data_fi = os.path.join(raw_data_dir, "data.jsonl")
web_src_dir = os.path.join("ai_companies_viz", "src")
image_dir = os.path.join(raw_data_dir, "logos")

def retrieve_raw() -> None:
    client = bigquery.Client()
    out = open(raw_data_fi, mode="w")
    for row in client.list_rows("ai_companies_visualization.visualization_data"):
        dict_row = {col: row[col] for col in row.keys()}
        out.write(json.dumps(dict_row)+"\n")

def retrieve_image(url: str, company_name: str, refresh_images: bool) -> str:
    if not url:
        return None
    cleanup = {
        " ": "_",
        "(": "",
        ")": "",
        "/": "_",
        ".": ""
    }
    company_name = company_name.lower()
    for from_char, to_char in cleanup.items():
        company_name = company_name.replace(from_char, to_char)
    img_name = company_name+".png"
    if refresh_images:
        response = requests.get(url)
        if response.status_code == 200:
            Image.open(BytesIO(response.content)).save(os.path.join(web_src_dir, "images", img_name))
        else:
            print("Download failed for "+url)
            return None
    return img_name

def clean_parent(parents: list) -> str:
    if len(parents) == 0:
        return None
    return ", ".join([parent["parent_name"].title()+(" (Acquired)" if parent["parent_acquisition"] else "")
                      for parent in parents])

def clean_children(agg_children: list, non_agg_children: list) -> str:
    has_agg = len(agg_children) > 0
    has_non_agg = len(non_agg_children) > 0
    if not (has_agg or has_non_agg):
        return None
    joined_agg_children = (f"Aggregated Children: {', '.join([c['child_name'].title() for c in agg_children])}"
                           if has_agg else "")
    joined_non_agg_children = ("Non-aggregated Children: "+
                                ", ".join([c["child_name"].title() for c in non_agg_children]) if has_non_agg else "")
    sep = "; " if has_agg and has_non_agg else ""
    return f"{joined_agg_children}{sep}{joined_non_agg_children}"

def clean(refresh_images: bool) -> None:
    rows = []
    with open(raw_data_fi) as f:
        for row in f:
            js = json.loads(row)
            js["name"] = js["name"].title()
            country = js["country"]
            if country is not None:
                country_obj = pycountry.countries.get(alpha_2=country)
                if not country_obj:
                    country_obj = pycountry.countries.get(alpha_3=country)
                js["country"] = country_obj.name
            logo_url = js.pop("logo_url")
            js["local_logo"] = retrieve_image(logo_url, js["name"], refresh_images)
            aliases = js.pop("aliases")
            js["aliases"] = None if len(aliases) == 0 else f"aka: {', '.join([a['alias'].title() for a in aliases])}"
            js["stage"] = js["stage"] if js["stage"] else "Unknown"
            grids = js.pop("grid")
            js["grid_info"] = ", ".join(grids)
            permids = js.pop("permid")
            js["permid_info"] = ", ".join([str(p) for p in permids])
            js["parent_info"] = clean_parent(js.pop("parent"))
            js["child_info"] = clean_children(js.pop("children"), js.pop("non_agg_children"))
            rows.append(js)
    with open(os.path.join(web_src_dir, "pages", "data.js"), mode="w") as out:
        out.write(f"const company_data = {json.dumps(rows)};\n\nexport {{ company_data }};")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh_raw", action="store_true", default=False)
    parser.add_argument("--refresh_images", action="store_true", default=False)
    args = parser.parse_args()

    if args.refresh_raw:
        retrieve_raw()
    clean(args.refresh_images)