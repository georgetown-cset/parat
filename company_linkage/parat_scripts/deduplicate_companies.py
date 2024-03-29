from google.cloud import bigquery
from collections import Counter
import argparse
import json


def get_companies():
    """
    Pulling the companies we want to clean
    :return: The queried iterator of companies
    """
    query = """SELECT * FROM high_resolution_entities.organizations_tmp"""
    client = bigquery.Client()
    companies = client.query(query)
    return companies


def clean_location(current_location, location):
    """
    Cleaning the location field
    :param current_location: Location of the entry we're looking at
    :param location: Location of the main entry for this identifier
    :return: The location field
    """
    current_country = current_location["country"]
    country = location["country"]
    # we want 2-character country codes because they're more common and we want consistency, swap if we don't have them
    if len(current_country) == 3 and len(country) == 2:
        current_location = location
    elif not (len(current_country) == 2 and len(country) == 3):
        # something has still gone wrong
        print(current_location, location)
    return current_location


def clean_website(current_website, website):
    """
    Cleaning the website field
    :param current_website: Website of the entry we're looking at
    :param website: Website of the main entry for this identifier
    :return: The website field
    """
    if "https" in website and "https" not in current_website:
        current_website = website
    elif "http" in website and "http" not in current_website:
        current_website = website
    # no else because we either want the current website or it doesn't matter
    # most of the differences are with/without ending slashes or /us or .com vs. .co.uk
    return current_website


def clean_aliases(current_aliases, aliases):
    """
    Cleaning the alias field. Main goal here is to include all aliases for the identifier.
    :param current_aliases: Aliases of the entry we're looking at
    :param aliases: Aliases of the main entry for this identifier
    :return: The alias field
    """
    current_aliases = set([(al["alias"], al["alias_language"]) for al in current_aliases])
    aliases = set([(al["alias"], al["alias_language"]) for al in aliases])
    all_aliases = current_aliases.union(aliases)
    final_aliases = [{"alias_language": val[1], "alias": val[0]} for val in all_aliases]
    return final_aliases


def clean_parents(current_parents_dup, parents_dup):
    """
    Cleaning the alias field. Main goal here is to include all parents for the identifier.
    :param current_parents_dup: Parents of the entry we're looking at
    :param parents_dup: Parents of the main entry for this identifier
    :return: The parents field
    """
    current_parents = set([(par["parent_acquisition"], par["parent_name"].lower(), par["parent_id"])
                           for par in current_parents_dup])
    parents = set([(par["parent_acquisition"], par["parent_name"].lower(), par["parent_id"]) for par in parents_dup])
    all_parents = current_parents.union(parents)
    final_parents = [{"parent_acquisition": val[0], "parent_name": val[1], "parent_id": val[2]}
                     for val in all_parents]
    parent_names = Counter([i[1] for i in all_parents])
    most_common_name = parent_names.most_common(1)[0]
    # We have some kind of duplicate, either parent acquisition as both true and false or a null parent ID
    if most_common_name[1] > 1:
        temp_parents = []
        parent_id = None
        parent_acquisition = None
        for parent in final_parents:
            # if we're looking at a duplicate
            if parent["parent_name"] == most_common_name[0]:
                if parent["parent_id"] is not None:
                    parent_id = parent["parent_id"]
                if parent_acquisition is None or parent_acquisition == parent["parent_acquisition"]:
                    parent_acquisition = parent["parent_acquisition"]
                elif parent["parent_name"] == "verizon":
                    # We've found one case where they disagree, check it
                    parent_acquisition = True
                else:
                    print("something is wrong")
            else:
                temp_parents.append(parent)
        temp_parents.append({"parent_acquisition": parent_acquisition,
                             "parent_name": most_common_name[0], "parent_id": parent_id})
        final_parents = temp_parents
    return final_parents


def clean_permid(name, current_permid, permid):
    """
    Cleaning the permid. This is a bit more manual because some of them had two and we have to decide which to use.
    :param name: Company name, so we can make manual decisions
    :param current_permid: Permid of the entry we're looking at
    :param permid: Permid of the main entry for this identifier
    :return: The permid field
    """
    permid_dict = {"roivant sciences": [5057747992, 5044178170],
                   "lockheed martin": [5000069094],
                   "osram": [5000600974, 5038081272],
                   "elsevier": [4297219144, 5000131860],
                   "schlumberger": [4295904888],
                   "symantec": [4295908065],
                   "kitty hawk": [4295906929, 5042004482]
                   }
    if current_permid != permid:
        if current_permid is None:
            current_permid = permid
        # if the difference is just that permid is None we don't care
        elif permid is not None:
            if name in permid_dict:
                current_permid = permid_dict[name]
            else:
                print("something has gone wrong in permids")
    # we're converting permid from an integer to a REPEATED if it's not already converted
    if current_permid is None:
        current_permid = []
    elif type(current_permid) == int:
        current_permid = [current_permid]
    return current_permid


def clean_market(current_market_dup, market_dup):
    """
    Cleaning the alias field. Main goal here is to include all markets for the identifier.
    :param current_market_dup: Markets of the entry we're looking at
    :param market_dup: Markets of the main entry for this identifier
    :return: The market field
    """
    current_market = set([(mar["exchange"], mar["ticker"]) for mar in current_market_dup])
    market = set([(mar["exchange"], mar["ticker"]) for mar in market_dup])
    all_market = current_market.union(market)
    final_market = [{"exchange": val[1], "ticker": val[0]} for val in all_market]
    return final_market


def clean_crunchbase(current_crunchbase, crunchbase):
    """
    Cleaning the crunchbase field. Basically we just want to get nicer urls here.
    :param current_crunchbase: Crunchbase of the entry we're looking at
    :param crunchbase: Crunchbase of the main entry for this identifier
    :return: The crunchbase field
    """
    # we're only going to swap urls if we can get an ODM url; otherwise the difference is meh
    if "odm_csv" in crunchbase["crunchbase_url"] and "odm_csv" not in current_crunchbase["crunchbase_url"]:
        if crunchbase["crunchbase_uuid"] == current_crunchbase["crunchbase_uuid"]:
            current_crunchbase["crunchbase_url"] = crunchbase["crunchbase_url"]
        else:
            print("something is wrong")
    return current_crunchbase


def clean_grid(current_grid_dup, grid_dup):
    """
    Cleaning the alias field. Main goal here is to include all grids for the identifier.
    :param current_grid_dup: Grids of the entry we're looking at
    :param grid_dup: Grids of the main entry for this identifier
    :return: The grid field
    """
    current_grid = set(current_grid_dup)
    return list(current_grid.union(grid_dup))


# No_grid was what we used to call the regex field when it was only used for companies that did not have a grid
def clean_no_grid(current_no_grid, no_grid):
    """
    Cleaning the no_grid field (now regex, but this cleanup was done before!) We want the more informative one.
    :param current_no_grid: No_grid of the entry we're looking at
    :param no_grid: No_grid of the main entry for this identifier
    :return: The no_grid field
    """
    if current_no_grid == "":
        current_no_grid = None
    if no_grid is not None and current_no_grid != no_grid:
        if current_no_grid is None:
            if no_grid != "":
                current_no_grid = no_grid
        # we want the longer regex if there's a conflict because it probably contains more info/aliases
        elif len(no_grid) > len(current_no_grid):
            current_no_grid = no_grid
    return current_no_grid


def clean_comment(current_comment, comment):
    """
    Cleaning comment. Basically, if one is blank, pick the other
    :param current_comment: Comment of the entry we're looking at
    :param comment: Comment of the main entry for this identifier
    :return: The comment field
    """
    if current_comment is None and comment != "":
        current_comment = comment
    if current_comment == "":
        current_comment = comment
    return current_comment


def clean_companies(companies):
    """
    Cleaning the whole list of companies. Add new entries. If an entry is a duplicate, go through all the cleaning steps,
     plus do some of the simple basically-in-line cleaning of fields.
    :param companies: The list of companies to clean
    :return: A dictionary containing all company data
    """
    company_dict = {}
    for company in companies:
        # if it's our first copy of a company, just add it
        if company["CSET_id"] not in company_dict:
            company_dict[company["CSET_id"]] = dict(company)
        # otherwise, deduplicate
        else:
            current_company_entry = company_dict[company["CSET_id"]]
            if current_company_entry["name"] != company["name"]:
                if "shell" in current_company_entry["name"]:
                    current_company_entry["name"] = "royal dutch shell"
                else:
                    print("something has gone wrong")
            if current_company_entry["location"] != company["location"]:
                current_company_entry["location"] = \
                    clean_location(current_company_entry["location"], company["location"])
            if current_company_entry["website"] != company["website"]:
                current_company_entry["website"] = clean_website(current_company_entry["website"], company["website"])
            if current_company_entry["aliases"] != company["aliases"]:
                current_company_entry["aliases"] = clean_aliases(current_company_entry["aliases"], company["aliases"])
            if current_company_entry["parent"] != company["parent"]:
                current_company_entry["parent"] = clean_parents(current_company_entry["parent"], company["parent"])
            current_company_entry["permid"] = clean_permid(current_company_entry["name"],
                                                           current_company_entry["permid"], company["permid"])
            if current_company_entry["market"] != company["market"]:
                current_company_entry["market"] = clean_market(current_company_entry["market"], company["market"])
            if current_company_entry["crunchbase"] != company["crunchbase"]:
                current_company_entry["crunchbase"] = \
                    clean_crunchbase(current_company_entry["crunchbase"], company["crunchbase"])
            if current_company_entry["grid"] != company["grid"]:
                current_company_entry["grid"] = clean_grid(current_company_entry["grid"], company["grid"])
            current_company_entry["no_grid"] = clean_no_grid(current_company_entry["no_grid"], company["no_grid"])
            if current_company_entry["BGOV_id"] != company["BGOV_id"]:
                if current_company_entry["BGOV_id"] is None and company["BGOV_id"] is not None:
                    current_company_entry["BGOV_id"] = company["BGOV_id"]
            if current_company_entry["comment"] != company["comment"]:
                current_company_entry["comment"] = clean_comment(current_company_entry["comment"], company["comment"])
    return company_dict


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", type=str, help="The name of the output file. Must be a jsonl")
    args = parser.parse_args()
    if ".jsonl" not in args.output:
        parser.print_help()
        exit()
    companies = get_companies()
    company_dict = clean_companies(companies)
    with open(args.output, "w") as output:
        for CSET_id, company_js in company_dict.items():
            if type(company_js["permid"]) == int:
                company_js["permid"] = [company_js["permid"]]
            output.write(json.dumps(company_js, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
