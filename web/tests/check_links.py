import json
import random
import re
import requests
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tqdm import tqdm

"""
Checks links are ok in src/static_data/{data.js,text.js}. Requires chromedriver to be on your PATH. 
Check this periodically while selenium is running.
"""


def check_tab_links() -> None:
    with open("parat/src/static_data/text.js") as f:
        js_dec = f.readlines()[0]
        links = set(re.findall(r"href=['\"]([^'\"]+)['\"]", js_dec))
    ok_links = 0
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:89.0) Gecko/20100101 Firefox/89.0"}
    for link in links:
        resp = requests.get(link, headers=headers)
        if resp.status_code != 200:
            print(f"{link} had status code {resp.status_code}")
        else:
            ok_links += 1
    print(f"{ok_links} of {len(links)} succeeded!")


def check_data_links() -> None:
    with open("parat/src/static_data/data.js") as f:
        js_dec = f.readlines()[0]
        meta = json.loads(js_dec.strip().strip(";").replace("const company_data = ", ""))
    links = set()
    browser = webdriver.Chrome()
    for company in meta:
        for key in ["website", "wikipedia_link", "company_site_link"]:
            if key in company and company[key]:
                links.add(company[key])
        if "crunchbase" in company and "crunchbase_url" in company["crunchbase"]:
            links.add(company["crunchbase"]["crunchbase_url"])
    print(f"Checking {len(links)} links")
    links = list(links)
    random.shuffle(links)
    num_seen_cb = 0
    for link in tqdm(links):
        if not link:
            continue
        is_crunchbase = "crunchbase" in link
        if is_crunchbase:
            time.sleep(5)
            num_seen_cb += 1
            if num_seen_cb == 20:
                num_seen_cb = 0
                browser.close()
                browser = webdriver.Chrome()
            elif num_seen_cb == 0:
                time.sleep(60)
        try:
            browser.get(link)
            if is_crunchbase:
                WebDriverWait(browser, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "h1"))
                )
                for elt in browser.find_elements_by_tag_name("h1"):
                    if "Page not found" in elt.text:
                        print("404 for "+link)
        except Exception as e:
            print(f"{link} threw {e}")


if __name__ == "__main__":
    check_tab_links()
    check_data_links()