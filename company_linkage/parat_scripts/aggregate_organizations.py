import argparse
from google.cloud import bigquery
import json
from collections import defaultdict
import subprocess

# List of company ids that should not be rolled up. At the moment, we've decided to not include anything here, but I'm
# going to leave the logic in place in case we change our minds later.
no_roll_up = []


class Organization:

    def __init__(self, cset_id, name):
        self.cset_id = cset_id
        self.name = name
        self.location = {}
        self.website = None
        self.description = None
        self.description_source = None
        self.description_link = None
        self.description_retrieval_date = None
        self.aliases = []
        self.permid = None
        self.child_permid = []
        self.market = []
        self.crunchbase = {}
        self.child_crunchbase = []
        self.ror = []
        self.regex = []
        self.bgov_id = []
        self.children = []
        self.non_agg_children = []
        self.parent = []
        self.linkedin = []
        self.in_fortune_global_500 = False
        self.in_sandp_500 = False
        self.in_global_big_tech = False
        self.in_gen_ai = False

    def add_location(self, city, province_state, country):
        """
        Adding location for aggregation
        :param city: city
        :param province_state: province or state
        :param country: country
        :return:
        """
        if city == "":
            city = None
        if province_state == "":
            province_state = None
        if country == "":
            country = None
        if city or province_state or country:
            self.location = {"city": city, "province_state": province_state, "country": country}

    def add_website(self, website):
        """
        Adding website for aggregation
        :param website: website
        :return:
        """
        if website is not None and website != "":
            self.website = website

    def add_description_metadata(self, org):
        """
        Adding description metadata for aggregation
        :param org: Org containing description metadata
        :return: None
        """
        if org["description"]:
            self.description = org["description"]
        if org["description_link"]:
            self.description_link = org["description_link"]
        if org["description_source"]:
            self.description_source = org["description_source"]
        if org["description_retrieval_date"]:
            self.description_retrieval_date = org["description_retrieval_date"]

    def add_alias(self, alias_language, alias):
        """
        Adding any aliases for aggregation
        :param alias_language: language alias is in
        :param alias: alias
        :return:
        """
        if alias_language == "":
            alias_language = None
        if alias == "":
            alias = None
        if alias_language or alias:
            alias_val = {"alias_language": alias_language, "alias": alias}
            if alias_val not in self.aliases:
                self.aliases.append(alias_val)

    def add_permid(self, permid):
        """
        Adding permid (from Refinitiv/Eikon) from parent org. There should only be one.
        :param permid: permid
        :return:
        """
        if permid and permid != "" and permid:
            self.permid = permid

    def add_child_permid(self, permid):
        """
        Adding permid (from Refinitiv/Eikon) from child organization for aggregation
        :param permid:
        :return:
        """
        if permid and permid != "" and permid not in self.child_permid:
            self.child_permid.append(permid)

    def add_market(self, exchange, ticker):
        """
        Adding exchange/ticker data for aggregation
        :param exchange: exchange
        :param ticker: ticker
        :return:
        """
        if exchange or ticker:
            market = {"exchange": exchange, "ticker": ticker}
            if market not in self.market:
                self.market.append(market)

    def add_crunchbase(self, uuid, url):
        """
        Adding crunchbase data for aggregation
        :param uuid: crunchbase uuid
        :param url: crunchbase url
        :return:
        """
        if uuid == "":
            uuid = None
        if url == "":
            url = None
        if uuid or url:
            # We're not worried about matching here because there's only one parent
            # The parent crunchbase should always get added
            self.crunchbase = {"crunchbase_uuid": uuid, "crunchbase_url": url}

    def add_child_crunchbase(self, uuid, url):
        """
        Adding crunchbase data of any child organizations for aggregation
        :param uuid: crunchbase uuid
        :param url: crunchbase url
        :return:
        """
        if uuid == "":
            uuid = None
        if url == "":
            url = None
        if uuid or url:
            crunchbase = {"crunchbase_uuid": uuid, "crunchbase_url": url}
            # We don't want it in our list and we don't want it to match the parent
            if crunchbase not in self.child_crunchbase and crunchbase != self.crunchbase:
                self.child_crunchbase.append(crunchbase)

    def add_ror(self, ror):
        """
        Adding ROR for aggregation
        :param ror: ror value
        :return:
        """
        if ror and ror not in self.ror:
            self.ror.append(ror)

    def add_regex(self, regex):
        """
        Adding regular expression for aggregation
        :param regex: regular expression
        :return:
        """
        if regex and regex not in self.regex:
            self.regex.append(regex)

    def add_bgov_id(self, bgov):
        """
        Adding Bloomberg gov id for aggregation
        :param bgov: Bloomberg gov ids
        :return:
        """
        for bgov_val in bgov:
            if bgov_val and bgov_val not in self.bgov_id:
                self.bgov_id.append(bgov_val)

    def add_child(self, child_id, child_name):
        """
        Adding parent company's children
        :param child_id: child's CSET-assigned ID
        :param child_name: child's name
        :return:
        """
        child = {"child_name": child_name, "child_id": child_id}
        if child not in self.children:
            self.children.append(child)

    def add_non_agg_child(self, child_id, child_name):
        """
        Adding parent company's children if children aren't getting rolled up into main company
        :param child_id: child's CSET-assigned ID
        :param child_name: child's name
        :return:
        """
        child = {"child_name": child_name, "child_id": child_id}
        if child not in self.non_agg_children:
            self.non_agg_children.append(child)

    def add_parent(self, parent_acquisition, parent_name, parent_id):
        """
        Adding parent of company (usually if there's no CSET id so company isn't getting rolled up)
        :param parent_acquisition: was the company acquired?
        :param parent_name: Name of parent company
        :param parent_id: CSET id of parent company
        :return:
        """
        if parent_name == "":
            parent_name = None
        if parent_acquisition or parent_name or parent_id:
            parent = {"parent_acquisition": parent_acquisition, "parent_name": parent_name, "parent_id": parent_id}
            if parent not in self.parent:
                # Don't want to add a new parent if we already have the parent id in parent
                # Even if acquisition/name info doesn't match
                for current_parent in self.parent:
                    if parent_id == current_parent["parent_id"]:
                        return
                self.parent.append(parent)

    def add_linkedin(self, linkedin):
        """
        Adding LinkedIn website link for aggregation
        :param linkedin: linkedin value
        :return:
        """
        if linkedin and linkedin not in self.linkedin:
            self.linkedin.append(linkedin)

    def add_sandp(self, in_sandp_500):
        self.in_sandp_500 = bool(in_sandp_500)

    def add_fortune(self, in_fortune_global_500):
        self.in_fortune_global_500 = bool(in_fortune_global_500)

    def add_in_global_big_tech(self, in_global_big_tech):
        self.in_global_big_tech = bool(in_global_big_tech)

    def add_in_gen_ai(self, in_gen_ai):
        self.in_gen_ai = bool(in_gen_ai)


class OrganizationAggregator:

    def __init__(self):
        """
        A class to aggregate organizations into parent organizations
        """
        self.parent_names = {}
        self.child_to_parent = defaultdict(list)
        self.full_aggregate_child_to_parent = defaultdict(list)
        self.organization_dict = {}

    def get_parents(self):
        """
        Getting all parents of a given organization; aggregating companies!
        :return:
        """
        query = "SELECT parent, CSET_id FROM high_resolution_entities.organizations"
        client = bigquery.Client()
        query_job = client.query(query)
        organizations = query_job.result()
        for organization in organizations:
            for par in organization.parent:
                if par["parent_id"] and par["parent_id"] != organization["CSET_id"]:
                    self.parent_names[par["parent_id"]] = par["parent_name"]
                    self.full_aggregate_child_to_parent[organization["CSET_id"]].append(par["parent_id"])
                    # we don't want to create a child-to-parent link if our child shouldn't be rolled up
                    if organization["CSET_id"] in no_roll_up:
                        continue
                    self.child_to_parent[organization["CSET_id"]].append(par["parent_id"])
        self.child_to_parent = self.aggregate_parents(self.child_to_parent, False)
        self.full_aggregate_child_to_parent = self.aggregate_parents(self.full_aggregate_child_to_parent, True)

    def aggregate_parents(self, child_mapping_dict, roll_up_everything):
        """
        The goal here is to create a dictionary mapping child organizations to their ultimate parent organization
        We have two ways to do this; one way where we include exceptions where some organizations are not rolled up
        And another where there are no exceptions and all organizations are rolled up
        We use both because we want to ultimately have a list of both the children and the non-aggregated children
        :param child_mapping_dict: The dictionary mapping orgs to parents
        :param roll_up_everything: Are we rolling up everything?
        :return:
        """
        for child in child_mapping_dict:
            # some children have multiple parents. These must be handled separately
            if len(child_mapping_dict[child]) > 1:
                new_parent = child
                for parent in child_mapping_dict[child]:
                    # if we are using the no_roll_up list to check which orgs do not get rolled up
                    # first, check if this parent is one that shouldn't be rolled up
                    # if it is, we know it's the ultimate parent -- select it and move on
                    if not roll_up_everything and parent in no_roll_up:
                        new_parent = [parent]
                        break
                    # if the parent still has a parent
                    if parent in child_mapping_dict:
                        # then grab its parents
                        temp_new_parent = child_mapping_dict[parent]
                    # but if it doesn't
                    else:
                        # then it's the ultimate parent
                        new_parent = [parent]
                # if we haven't yet changed the parent
                if new_parent == child_mapping_dict[child]:
                    # then assign the parent's parent
                    new_parent = temp_new_parent
                child_mapping_dict[child] = new_parent
            else:
                parent = child_mapping_dict[child][0]
                # if the child's parent is also a child
                if parent in child_mapping_dict:
                    # set its parent to its parent's parent
                    child_mapping_dict[child] = child_mapping_dict[parent]
        return child_mapping_dict

    def get_organizations(self):
        """
        Creating all of our new organizations with all the parent and child data
        :return:
        """
        query = "SELECT * FROM high_resolution_entities.organizations"
        client = bigquery.Client()
        query_job = client.query(query)
        organizations = query_job.result()
        for org in organizations:
            org_id = org["CSET_id"]
            if org_id in self.child_to_parent:
                # this means the org is a child so we don't want to add it directly
                assert len(self.child_to_parent[org_id]) == 1
                parent = self.child_to_parent[org_id][0]
                # first we ensure the parent is in the organization dict
                org_info = self.make_new_org(parent)
                # then we update the parent's entry with all new identifiers from the org
                self.update_organization_identifiers(org, parent)
                # and we add the org as a child of the parent
                org_info.add_child(org_id, org["name"])
                agg_parent = self.full_aggregate_child_to_parent[org_id][0]
                if agg_parent != parent:
                    # want to add the aggregated parent to the org dict if it's not there
                    org_info = self.make_new_org(agg_parent)
                    # then add aggregated parent's children
                    org_info.add_non_agg_child(org_id, org["name"])
            else:
                # we don't need to save off the org info here because we're not adding children
                self.make_new_org(org_id, org["name"])
                self.update_organization_data(org, org_id)
                self.update_organization_identifiers(org, org_id)
                # if the org would have been a child but isn't getting rolled up!
                if org_id in self.full_aggregate_child_to_parent:
                    parent = self.full_aggregate_child_to_parent[org_id][0]
                    org_info = self.make_new_org(parent)
                    org_info.add_non_agg_child(org_id, org["name"])

    def make_new_org(self, org_id, name=None):
        """
        Making a new organization that is capable of holding child org data if needed
        :param org_id: The organization's CSET id
        :param name: The name of the child org
        :return:
        """
        if org_id not in self.organization_dict:
            # we provide a name for child orgs, but not for parents
            if not name:
                name = self.parent_names[org_id]
            org_info = Organization(org_id, name)
            self.organization_dict[org_id] = org_info
        return self.organization_dict[org_id]

    def update_organization_identifiers(self, org, org_id):
        """
        Adding more organization identifiers to an organization's data entry
        :param org: The organization's data entry getting info added to it
        :param org_id: The CSET id of the organization whose info we are adding
        :return:
        """
        org_info = self.organization_dict[org_id]
        # We add crunchbase and permid as children if it's a child org; otherwise we add as primary crunchbase/permid
        if org["CSET_id"] in self.child_to_parent:
            org_info.add_child_crunchbase(org["crunchbase_uuid"], org["crunchbase_url"])
            org_info.add_child_permid(org["permid"])
        else:
            org_info.add_crunchbase(org["crunchbase_uuid"], org["crunchbase_url"])
            org_info.add_permid(org["permid"])
        for ror in org["ror_id"]:
            org_info.add_ror(ror)
        for regex in org["regex"]:
            org_info.add_regex(regex)
        for linkedin in org["linkedin"]:
            org_info.add_linkedin(linkedin)
        org_info.add_bgov_id(org["BGOV_id"])

    def update_organization_data(self, org, org_id):
        """
        Adding metadata about an organization to an organization's data entry
        :param org: The organization's data entry getting info added to it
        :param org_id: The CSET id of the organization whose info we are adding
        :return:
        """
        org_info = self.organization_dict[org_id]
        org_info.add_location(org["location"]["city"], org["location"]["province_state"], org["location"]["country"])
        org_info.add_website(org["website"])
        org_info.add_description_metadata(org)
        for alias in org["aliases"]:
            org_info.add_alias(alias["alias_language"], alias["alias"])
        for market in org["market"]:
            org_info.add_market(market["exchange"], market["ticker"])
        for parent in org["parent"]:
            org_info.add_parent(parent["parent_acquisition"], parent["parent_name"], parent["parent_id"])
        org_info.add_sandp(org["in_sandp_500"])
        org_info.add_fortune(org["in_fortune_global_500"])
        org_info.add_in_global_big_tech(org["in_global_big_tech"])
        org_info.add_in_gen_ai(org["in_gen_ai"])

    def print_output(self, output_file, local):
        """
        Writing the aggregated organization output to file
        :param output_file: The output file we're writing to
        :return:
        """
        out = open(output_file, "w")
        for org_id, org_info in self.organization_dict.items():
            desc_date = org_info.description_retrieval_date
            fmt_desc_date = None if not desc_date else desc_date.strftime("%Y-%m-%d")
            js = {"CSET_id": org_info.cset_id, "name": org_info.name,
                  "location": org_info.location, "website": org_info.website,
                  "description": org_info.description, "description_source": org_info.description_source,
                  "description_link": org_info.description_link,
                  "description_retrieval_date": fmt_desc_date,
                  "aliases": org_info.aliases, "parent": org_info.parent,
                  "permid": org_info.permid, "child_permid": org_info.child_permid, "market": org_info.market,
                  "crunchbase": org_info.crunchbase, "child_crunchbase": org_info.child_crunchbase,
                  "ror_id": org_info.ror, "regex": org_info.regex,
                  "BGOV_id": org_info.bgov_id, "linkedin": org_info.linkedin,
                  "in_sandp_500": org_info.in_sandp_500, "in_fortune_global_500": org_info.in_fortune_global_500,
                  "in_global_big_tech": org_info.in_global_big_tech, "in_gen_ai": org_info.in_gen_ai,
                  "children": org_info.children,
                  "non_agg_children": org_info.non_agg_children}
            out.write(json.dumps(js, ensure_ascii=False) + "\n")
        out.close()
        if not local:
            subprocess.run(["gsutil", "-m", "cp", "-r", output_file, "gs://airflow-data-exchange/ai_companies_visualization/tmp/"], check=True)


def aggregate_organizations(output_file, local=False):
    aggregator = OrganizationAggregator()
    aggregator.get_parents()
    aggregator.get_organizations()
    aggregator.print_output(output_file, local)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output_file", required=True, help="A jsonl file for writing output data to create new tables")
    parser.add_argument("--from_airflow", default=False, action="store_true",
                        help="If true, will upload output to GCS")
    args = parser.parse_args()
    if not args.output_file.endswith(".jsonl"):
        parser.print_help()
    aggregate_organizations(args.output_file, local=not args.from_airflow)

