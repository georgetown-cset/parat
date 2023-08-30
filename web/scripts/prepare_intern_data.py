import argparse
import csv
import json
import os
import urllib.parse

"""
Prepare data for intern annotation.
"""


def get_intern_data(input_fi: str, output_fi: str):
    """
    Format data for interns, to use in their search for more detailed company descriptions. Instructions
    for how to use this data were:

    For each row, please:
      1.) Go to the link in the wikipedia_search column. If you are redirected to a wikipedia page for the company
          in the company_name column, or the first search result is for that company, then:
        a.) Put the first paragraph of the wikipedia article in the wikipedia_description column.
        b.) Put the wikipedia link for the company in the wikipedia_description_link column.
        c.) Put the current date in the retrieval_date column
      2.) If you can't find the company on wikipedia, go to the company's website (in the column company_homepage)
          and try to find an "about" page that contains a 1-paragraph-ish description of the company
          (this description may be found on the homepage or elsewhere on the site). If you can quickly find a
          suitable description:
        a.) Put this description in the company_description column
        b.) Put the link to the page where you found this description in the company_description_link column
        c.) Put the current date in the retrieval_date column

    If you couldn't complete steps (1) or (2) quickly for a company, then don't worry about it and move on.
    :param input_fi: jsonl export from ai_companies_visualization.visualization_data
    :param output_fi: file where output csv should be written
    :return: None
    """
    companies_with_existing_descriptions = set()
    with open(os.path.join("raw_data", "supplemental_company_descriptions.csv")) as f:
        for line in csv.DictReader(f):
            companies_with_existing_descriptions.add(line["company_name"].lower())
    rows = []
    with open(input_fi) as f:
        for line in f:
            js = json.loads(line)
            if js["name"].lower() in companies_with_existing_descriptions:
                continue
            has_null_description = ("short_description" not in js) or (not js["short_description"])
            encoded_wiki_search = urllib.parse.urlencode({"search": js["name"]})
            rows.append({
                "company_name": js["name"],
                "wikipedia_search": f"https://en.wikipedia.org/wiki/Special:Search?"+encoded_wiki_search,
                "company_homepage": js.get("website"),
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
    parser.add_argument("input_fi", help="Path to file containing raw jsonl data download from BQ containing "
                             "ai_companies_visualization.visualization_data")
    parser.add_argument("output_fi", help="Path where output csv for intern consumption should be written")
    args = parser.parse_args()

    get_intern_data(args.input_fi, args.output_fi)