import json
import re
import requests

"""
Checks links in src/static_data/{data.js,text.js}  
"""


def check_tab_links() -> None:
    with open("parat/src/static_data/text.js") as f:
        js_dec = f.readlines()[0]
        links = set(re.findall(r"href=['\"]([^'\"]+)['\"]", js_dec))
    ok_links = 0
    for link in links:
        resp = requests.get(link)
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
    for company in meta:
        for key in ["website", "crunchbase_url", "wikipedia_link", "company_site_link"]:
            if key in company and company[key]:
                links.add(company[key])
    print(f"Checking {len(links)} links")
    ok_links = 0
    for link in links:
        resp = requests.get(link)
        if resp.status_code != 200:
            print(f"{link} had status code {resp.status_code}")
        else:
            ok_links += 1
    print(f"{ok_links} of {len(links)} succeeded!")


if __name__ == "__main__":
    check_tab_links()
    check_data_links()