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
            js["local_logo"] = retrieve_image(js["logo_url"], js["name"], refresh_images)
            js["stage"] = js["stage"] if js["stage"] else "Unknown"
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