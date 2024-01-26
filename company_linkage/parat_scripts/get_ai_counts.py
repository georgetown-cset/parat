import argparse
import json
from collections import defaultdict

from google.cloud import bigquery


class CountGetter:

    def __init__(self) -> None:
        """
        CountGetter is intended to get counts of various things; currently it is able to
        count papers (from any dataset correctly configured, so it can count AI papers,
        AI papers in top conferences, etc.) and AI patents (from Dimensions and 1790 jointly).
        """
        self.regex_dict = defaultdict(list)
        self.ror_dict = defaultdict(list)
        self.cset_ids = []
        self.company_ids = []
        self.patent_fields = ["Physical_Sciences_and_Engineering",
                              "Life_Sciences",
                              "Security__eg_cybersecurity",
                              "Transportation",
                              "Industrial_and_Manufacturing",
                              "Education",
                              "Document_Mgt_and_Publishing",
                              "Military",
                              "Agricultural",
                              "Computing_in_Government",
                              "Personal_Devices_and_Computing",
                              "Banking_and_Finance",
                              "Telecommunications",
                              "Networks__eg_social_IOT_etc",
                              "Business",
                              "Energy_Management",
                              "Entertainment",
                              "Nanotechnology",
                              "Semiconductors",
                              "Language_Processing",
                              "Speech_Processing",
                              "Knowledge_Representation",
                              "Planning_and_Scheduling",
                              "Control",
                              "Distributed_AI",
                              "Robotics",
                              "Computer_Vision",
                              "Analytics_and_Algorithms",
                              "Measuring_and_Testing",
                              "Logic_Programming",
                              "Fuzzy_Logic",
                              "Probabilistic_Reasoning",
                              "Ontology_Engineering",
                              "Machine_Learning",
                              "Search_Methods"]

    def get_identifiers(self) -> None:
        """
        Pulling the regular expressions used to find papers and patents through means other than GRID.
        :return:
        """
        regex_query = """SELECT CSET_id, regex, ror_id FROM
                            `gcp-cset-projects.high_resolution_entities.aggregated_organizations`"""
        client = bigquery.Client()
        query_job = client.query(regex_query)
        results = query_job.result()
        for result in results:
            if result.regex:
                for regex in result.regex:
                    self.regex_dict[result.CSET_id].append(regex)
            if result.ror_id:
                for ror in result.ror_id:
                    self.ror_dict[result.CSET_id].append(ror)
            self.cset_ids.append(result.CSET_id)

    def run_query_papers(self, table_name: str, field_name: str, test: bool = False, by_year: bool = False) -> list:
        """
        Running a query to find paper counts using regex for papers missing ROR. This query combines
        this data with preexisting paper counts already identified using SQL for papers that have ROR.
        We no longer use this query for AI papers, but it is still used for top conference papers and
        total papers.
        :param table_name: The table to look for papers in
        :param field_name: The json field name
        :param test: False if not running as a unit test
        :param by_year: False if not adding by_year data
        :return:
        """
        client = bigquery.Client()
        companies = []
        field_name_by_year = f"{field_name}_by_year"
        for i, cset_id in enumerate(self.cset_ids):
            row_dict = {"CSET_id": cset_id, field_name: None}
            if cset_id not in self.regex_dict:
                # if it's not in the regex_dict, that's bad
                print(cset_id)
            else:
                regexes = self.regex_dict[cset_id]
                query = f"""SELECT COUNT(DISTINCT merged_id) as paper_count FROM `{table_name}`
                         WHERE regexp_contains(org_name, r'(?i){regexes[0]}') """
                # if we have more than one regex for an org, include all of them
                if len(regexes) > 1:
                    for regex in regexes[1:]:
                        query += f"""OR regexp_contains(org_name, r'(?i){regex}') """
                if cset_id in self.ror_dict:
                    query += f"""OR ror_id IN ({str(self.ror_dict[cset_id])[1:-1]})"""
                query_job = client.query(query)
                # query_job is an iterator, so even though we're only returning one row we're going to loop
                for element in query_job:
                    row_dict[field_name] = element["paper_count"]
                # if we don't have total data, we won't have by_year either
                if by_year:
                    row_dict[field_name_by_year] = self.run_query_papers_by_year(table_name, field_name, regexes,
                                                                                 self.ror_dict[cset_id])
            if not row_dict[field_name]:
                # if we end up without any papers, set that to be true
                row_dict[field_name] = 0
            # If we don't have by-year data
            if by_year and not field_name_by_year in row_dict:
                row_dict[field_name_by_year] = []
            companies.append(row_dict)
            if test and i == 25:
                break
        return companies

    def run_query_papers_by_year(self, table_name: str, field_name: str, regexes: list, rors: list) -> list:
        """
        Getting the same paper count data, except split by year.
        We no longer use this query for AI papers, but it is still used for top conference papers and
        total papers.
        :param table_name: The table to look for papers in
        :param field_name: The json field name
        :param regexes: The regexes for whichever CSET_id we're searching for
        :param rors: The rors for whichever CSET_id we're searching for if they exist; otherwise an empty list
        :return:
        """
        field_name_by_year = f"{field_name}_by_year"
        # regex_to_use = rf"r'(?i){regexes[0]}'"
        query = f"""SELECT
                      STRUCT(year,
                        COUNT(merged_id) AS {field_name}) AS {field_name_by_year}
                    FROM
                      `{table_name}`
                    WHERE
                      REGEXP_CONTAINS(org_name, r'(?i){regexes[0]}') """
        if len(regexes) > 1:
            for regex in regexes[1:]:
                # regex_to_use = rf"r'(?i){regex}'"
                query += f"""OR regexp_contains(org_name, r'(?i){regex}') """
        if rors:
            query += f"""OR ror_id IN ({str(rors)[1:-1]}) """
        query += """GROUP BY year ORDER BY year"""
        client = bigquery.Client()
        query_job = client.query(query)
        by_year = [row[field_name_by_year] for row in query_job]
        return by_year

    def run_query_id_papers(self, table_name: str, test: bool = False) -> list:
        """
        Running a query to find all AI papers associated with a given CSET id
        using regex for papers missing GRID. This query combines
        this data with preexisting paper counts already identified using SQL for papers that have GRID.
        :param table_name: The table to look for papers in
        :param test: False if not running as a unit test
        :return:
        """
        companies_query = f"""-- SELECT CSET_id, ror_id FROM 
        # `gcp-cset-projects.high_resolution_entities.aggregated_organizations`"""
        # if test:
        #     companies_query += """ LIMIT 25"""
        client = bigquery.Client()
        # query_job = client.query(companies_query)
        company_rows = []
        for i, cset_id in enumerate(self.cset_ids):
            if test and i == 25:
                break
            # self.company_ids.append(cset_id)
            if cset_id not in self.regex_dict:
                # if it's not in the regex_dict that's bad
                print(cset_id)
            else:
                regexes = self.regex_dict[cset_id]
                query = f"""SELECT DISTINCT merged_id, year, cv, nlp, robotics FROM `{table_name}`
                         WHERE regexp_contains(org_name, r'(?i){regexes[0]}') """
                # if we have more than one regex for an org, include all of them
                if len(regexes) > 1:
                    for regex in regexes[1:]:
                        query += f"""OR regexp_contains(org_name, r'(?i){regex}') """
                if cset_id in self.ror_dict:
                    # self.ror_dict[row["CSET_id"]] = row["ror_id"]
                    query += f"""OR ror_id IN ({str(self.ror_dict[cset_id])[1:-1]})"""
                query_job = client.query(query)
                # get all the merged ids
                for element in query_job:
                    company_rows.append({"CSET_id": cset_id, "merged_id": element["merged_id"],
                                "year": element["year"], "cv": element["cv"],
                                "nlp": element["nlp"], "robotics": element["robotics"]})
        return company_rows

    def run_query_id_patents(self, table_name: str, ai: bool = True, test: bool = False):
        """
        Get patent counts one by one using CSET_ids.
        :return:
        """
        patent_companies = []
        for i, cset_id in enumerate(self.cset_ids):
            if test and i == 25:
                break
            if cset_id in self.regex_dict:
                regexes = self.regex_dict[cset_id]
                rors = self.ror_dict[cset_id]
                query = f"""SELECT DISTINCT 
                              family_id, 
                              priority_year,
                        """
                if ai:
                    query += f"""
                              Physical_Sciences_and_Engineering,
                              Life_Sciences,
                              Security__eg_cybersecurity,
                              Transportation,
                              Industrial_and_Manufacturing,
                              Education,
                              Document_Mgt_and_Publishing,
                              Military,
                              Agricultural,
                              Computing_in_Government,
                              Personal_Devices_and_Computing,
                              Banking_and_Finance,
                              Telecommunications,
                              Networks__eg_social_IOT_etc,
                              Business,
                              Energy_Management,
                              Entertainment,
                              Nanotechnology,
                              Semiconductors,
                              Language_Processing,
                              Speech_Processing,
                              Knowledge_Representation,
                              Planning_and_Scheduling,
                              Control,
                              Distributed_AI,
                              Robotics,
                              Computer_Vision,
                              Analytics_and_Algorithms,
                              Measuring_and_Testing,
                              Logic_Programming,
                              Fuzzy_Logic,
                              Probabilistic_Reasoning,
                              Ontology_Engineering,
                              Machine_Learning,
                              Search_Methods """
                query += f"""
                              FROM
                            staging_ai_companies_visualization.{table_name}
                             WHERE regexp_contains(assignee, r'(?i){regexes[0]}') """
                # if we have more than one regex for an org, include all of them
                if len(regexes) > 1:
                    for regex in regexes[1:]:
                        query += f"""OR regexp_contains(assignee, r'(?i){regex}') """
                if rors:
                    query += f"""OR ror_id IN ({str(rors)[1:-1]})"""
                client = bigquery.Client()
                query_job = client.query(query)
                for row in query_job:
                    new_patent_row = {"CSET_id": cset_id, "family_id": row["family_id"], "priority_year": row["priority_year"]}
                    if ai:
                        patent_field_data = {i : row[i] for i in self.patent_fields}
                        new_patent_row.update(patent_field_data)
                    patent_companies.append(new_patent_row)
                # company["ai_patents_by_year"] = self.run_query_patents_by_year(company["CSET_id"])
            else:
                print(cset_id)
        return patent_companies

    def write_output(self, row_list: list, output_file) -> None:
        """
        Write output to jsonl
        :param row_list: The list of data to write out
        :return:
        """
        out = open(output_file, "w")
        for row in row_list:
            out.write(json.dumps(row, ensure_ascii=False) + "\n")
        out.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_papers", type=str,
                        help="A jsonl file for writing output paper data to create new tables")
    parser.add_argument("output_patents", type=str,
                        help="A jsonl file for writing output patent data to create new tables")
    parser.add_argument("output_patent_grants", type=str,
                        help="A jsonl file for writing output patent grants data to create new tables")
    args = parser.parse_args()
    if "jsonl" not in args.output_papers or "jsonl" not in args.output_patents:
        parser.print_help()
    count_getter = CountGetter()
    print("Fetching identifiers")
    count_getter.get_identifiers()
    table_name = "gcp-cset-projects.staging_ai_companies_visualization.ai_publications"
    print("Fetching paper data")
    company_rows = count_getter.run_query_id_papers(table_name)
    print("Writing results")
    count_getter.write_output(company_rows, args.output_papers)
    print("Fetching patent applications data")
    patent_companies = count_getter.run_query_id_patents("linked_ai_patents")
    print("Writing results")
    count_getter.write_output(patent_companies, args.output_patents)
    print("Fetching patent grants data")
    patent_grant_companies = count_getter.run_query_id_patents("linked_ai_patents_grants")
    print("Writing results")
    count_getter.write_output(patent_grant_companies, args.output_patent_grants)

if __name__ == "__main__":
    main()