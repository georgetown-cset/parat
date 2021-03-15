import argparse
import csv
import json

def get_intern_data(input_fi, output_fi):
    out = csv.DictWriter(open(output_fi, mode="w"),
            fieldnames=["company_name", "aliases", "company_link", "wikipedia_description", "wikipedia_link",
                        "company_description", "crunchbase_description"])
    out.writeheader()
    with open(input_fi) as f:
        for line in f:
            js = json.loads(line)
            out.writerow({
                "company_name": js["name"],
                "aliases": "; ".join([a["alias"] for a in js["aliases"]]),
                "company_link": js["website"],
                "crunchbase_description": "" if "short_description" not in js else js["short_description"]
            })


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input_fi")
    parser.add_argument("output_fi")
    args = parser.parse_args()

    get_intern_data(args.input_fi, args.output_fi)