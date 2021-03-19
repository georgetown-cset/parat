import argparse
import csv
import json
import urllib.parse

def get_intern_data(input_fi, output_fi):
    rows = []
    with open(input_fi) as f:
        for line in f:
            js = json.loads(line)
            has_null_description = ("short_description" not in js) or (not js["short_description"])
            encoded_wiki_search = urllib.parse.urlencode({"search": js["name"]})
            rows.append({
                "company_name": js["name"],
                "wikipedia_search": f"https://en.wikipedia.org/wiki/Special:Search?"+encoded_wiki_search,
                "company_homepage": js["website"],
                "crunchbase_description": "" if has_null_description else js["short_description"]
            })
    with open(output_fi, mode="w") as f:
        out = csv.DictWriter(f, fieldnames=["company_name", "crunchbase_description", "wikipedia_search",
                                            "wikipedia_description", "wikipedia_description_link", "company_homepage",
                                            "company_description", "company_description_link"])
        out.writeheader()
        for row in sorted(rows, key=lambda r: len(r["crunchbase_description"])):
            out.writerow(row)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input_fi")
    parser.add_argument("output_fi")
    args = parser.parse_args()

    get_intern_data(args.input_fi, args.output_fi)