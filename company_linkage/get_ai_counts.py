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

    def get_regex(self) -> None:
        """
        Pulling the regular expressions used to find papers and patents through means other than GRID.
        :return:
        """
        regex_query = """SELECT CSET_id, regex FROM
                            `gcp-cset-projects.high_resolution_entities.aggregated_organizations`"""
        client = bigquery.Client()
        query_job = client.query(regex_query)
        regexes = query_job.result()
        for regex_result in regexes:
            if regex_result.regex:
                for regex in regex_result.regex:
                    self.regex_dict[regex_result.CSET_id].append(regex)

    def run_query_papers(self, table_name: str, field_name: str, test: bool = False, by_year: bool = False) -> list:
        """
        Running a query to find paper counts using regex for papers missing GRID. This query combines
        this data with preexisting paper counts already identified using SQL for papers that have GRID.
        :param table_name: The table to look for papers in
        :param field_name: The json field name
        :param test: False if not running as a unit test
        :param by_year: False if not adding by_year data
        :return:
        """
        companies_query = f"""SELECT CSET_id, grid, {field_name} """
        if by_year:
            field_name_by_year = f"{field_name}_by_year"
            companies_query += f""", {field_name_by_year} """
        companies_query += """FROM `gcp-cset-projects.ai_companies_visualization.visualization_data`"""
        if test:
            companies_query += """ LIMIT 10"""
        client = bigquery.Client()
        query_job = client.query(companies_query)
        companies = []
        for i, row in enumerate(query_job):
            row_dict = {"CSET_id": row["CSET_id"], field_name: row[field_name]}
            if by_year:
                # Check if there's by year data already; if so, add it
                if row[field_name_by_year] and row[field_name_by_year][0]["year"] is not None:
                    row_dict[field_name_by_year] = row[field_name_by_year]
            # if we don't have a grid to find the publication count but we do have a regex to find it
            if not row["grid"]:
                if row["CSET_id"] not in self.regex_dict:
                    # if it's not in the regex_dict but also has no grid, that's bad
                    print(row["CSET_id"])
                else:
                    regexes = self.regex_dict[row['CSET_id']]
                    query = f"""SELECT COUNT(DISTINCT merged_id) as paper_count FROM `{table_name}`
                             WHERE regexp_contains(org_names, r'(?i){regexes[0]}') """
                    # if we have more than one regex for an org, include all of them
                    if len(regexes) > 1:
                        for regex in regexes[1:]:
                            query += f"""OR regexp_contains(org_names, r'(?i){regex}') """
                    query_job = client.query(query)
                    # query_job is an iterator, so even though we're only returning one row we're going to loop
                    for element in query_job:
                        row_dict[field_name] = element["paper_count"]
                    # if we don't have total data, we won't have by_year either
                    if by_year:
                        row_dict[field_name_by_year] = self.run_query_papers_by_year(table_name, field_name, regexes)
            elif not row[field_name]:
                # if we have a grid but don't have any papers, set that to be true
                row_dict[field_name] = 0
            # If we have a grid but don't have by-year data
            if by_year and not field_name_by_year in row_dict:
                row_dict[field_name_by_year] = []
            companies.append(row_dict)
        return companies

    def run_query_papers_by_year(self, table_name: str, field_name: str, regexes: list) -> list:
        field_name_by_year = f"{field_name}_by_year"
        # regex_to_use = rf"r'(?i){regexes[0]}'"
        query = f"""SELECT
                      STRUCT(year,
                        COUNT(merged_id) AS {field_name}) AS {field_name_by_year}
                    FROM
                      `{table_name}`
                    WHERE
                      REGEXP_CONTAINS(org_names, r'(?i){regexes[0]}') """
        if len(regexes) > 1:
            for regex in regexes[1:]:
                # regex_to_use = rf"r'(?i){regex}'"
                query += f"""OR regexp_contains(org_names, r'(?i){regex}') """
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
        companies_query = f"""SELECT CSET_id, grid FROM 
        `gcp-cset-projects.high_resolution_entities.aggregated_organizations`"""
        if test:
            companies_query += """ LIMIT 25"""
        client = bigquery.Client()
        query_job = client.query(companies_query)
        company_rows = []
        for i, row in enumerate(query_job):
            # if we don't have a grid to find the publication count but we do have a regex to find it
            self.company_ids.append(row["CSET_id"])
            if not row["grid"]:
                if row["CSET_id"] not in self.regex_dict:
                    # if it's not in the regex_dict but also has no grid, that's bad
                    print(row["CSET_id"])
                else:
                    regexes = self.regex_dict[row['CSET_id']]
                    query = f"""SELECT DISTINCT merged_id, year, cv, nlp, robotics FROM `{table_name}`
                             WHERE regexp_contains(org_names, r'(?i){regexes[0]}') """
                    # if we have more than one regex for an org, include all of them
                    if len(regexes) > 1:
                        for regex in regexes[1:]:
                            query += f"""OR regexp_contains(org_names, r'(?i){regex}') """
                    query_job = client.query(query)
                    # get all the merged ids
                    for element in query_job:
                        company_rows.append({"CSET_id": row["CSET_id"], "merged_id": element["merged_id"],
                                    "year": element["year"], "cv": element["cv"],
                                    "nlp": element["nlp"], "robotics": element["robotics"]})
        return company_rows

    def run_query_patents(self, companies: list) -> list:
        """
        Running a query to find AI patent counts using both Dimensions and 1790 for patents with and without GRID.
        :param companies: The list of company entries with CSET ids that we want to count patents for
        :return:
        """
        for company in companies:
            if company["CSET_id"] in self.regex_dict:
                query = f"""WITH
                              -- First we pull all the CSET ids and their associated grids
                              id_grid AS (
                              SELECT
                                DISTINCT CSET_id AS id,
                                grids,
                                regexes
                              FROM
                                -- from the aggregated organizations table
                                `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
                                -- Adding in the associated grids
                              LEFT JOIN
                                UNNEST(grid) AS grids
                              CROSS JOIN
                                UNNEST(regex) AS regexes),
                              -- Then we get the data for the specific CSET id we want
                              specific_id_grid AS (
                              SELECT
                                id,
                                grids,
                                regexes
                              FROM
                                id_grid
                                -- The specific CSET id goes here
                              WHERE
                                id = {company["CSET_id"]}),
                              -- Now we pull all the AI-specific dimensions patents by grid id, simple family id, and org name
                              -- Our goal here is to be able to count every family of patents that has an assignee with a grid associated to our CSET id
                              -- We use both current and original assignee because we're interested in if a company had a patent initially or if they acquired one/acquired a company with one
                              ai_pats AS (
                              SELECT
                                grid,
                                family_id,
                                priority_year,
                                org_name
                              FROM
                                `gcp-cset-projects.ai_companies_visualization.grid_ai_patents` ),
                              ai_no_grid_patents AS (
                              SELECT
                                {company["CSET_id"]} AS cset_id,
                                family_id,
                                priority_year,
                                assignee
                              FROM
                                `gcp-cset-projects.ai_companies_visualization.no_grid_ai_patents`),
                              -- Now we want to combine the AI patents from Dimensions' current assignees, the AI patents from Dimensions' original assignees,
                              -- And the AI patents from 1790 analytics. We use simple_family_id as our unit of counting
                              combined_patent_list AS (
                              SELECT
                                DISTINCT family_id,
                                priority_year
                              FROM
                                -- Get our specific grid ids
                                specific_id_grid
                              INNER JOIN
                                -- Get all the AI patents with current assignees who have those grids
                                ai_pats
                              ON
                                specific_id_grid.grids = ai_pats.grid
                              UNION DISTINCT
                              SELECT
                                DISTINCT family_id,
                                priority_year,
                              FROM
                                -- Get all no_grid patents
                                ai_no_grid_patents
                              LEFT JOIN
                                -- Get our specific grid id and regex
                                specific_id_grid
                              ON
                                ai_no_grid_patents.cset_id = specific_id_grid.id
                                -- Narrow to only the patents whose assignee matches the company regex
                              WHERE
                                REGEXP_CONTAINS(LOWER(assignee), specific_id_grid.regexes))
                            SELECT
                              COUNT(DISTINCT family_id) AS ai_patents
                            FROM
                              combined_patent_list"""
                client = bigquery.Client()
                query_job = client.query(query)
                for row in query_job:
                    company["ai_patents"] = row["ai_patents"]
                company["ai_patents_by_year"] = self.run_query_patents_by_year(company["CSET_id"])
            else:
                print(company["id"])
                company["ai_patents"] = None
                company["ai_patents_by_year"] = []
        return companies

    def run_query_patents_by_year(self, cset_id: int):
        """
        Running the patents query with by-year breakdowns
        :param cset_id: The CSET id of the organization we want to run the query on
        :return:
        """
        query = f"""WITH
                      -- First we pull all the CSET ids and their associated grids
                      id_grid AS (
                      SELECT
                        DISTINCT CSET_id AS id,
                        grids,
                        regexes
                      FROM
                        -- from the aggregated organizations table
                        `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
                        -- Adding in the associated grids
                      LEFT JOIN
                        UNNEST(grid) AS grids
                      CROSS JOIN
                        UNNEST(regex) AS regexes),
                      -- Then we get the data for the specific CSET id we want
                      specific_id_grid AS (
                      SELECT
                        id,
                        grids,
                        regexes
                      FROM
                        id_grid
                        -- The specific CSET id goes here
                      WHERE
                        id = {cset_id}),
                      -- Now we pull all the AI-specific dimensions patents by grid id, simple family id, and org name
                      -- Our goal here is to be able to count every family of patents that has an assignee with a grid associated to our CSET id
                      -- We use both current and original assignee because we're interested in if a company had a patent initially or if they acquired one/acquired a company with one
                      ai_pats AS (
                      SELECT
                        grid,
                        family_id,
                        priority_year,
                        org_name
                      FROM
                        `gcp-cset-projects.ai_companies_visualization.grid_ai_patents` ),
                      ai_no_grid_patents AS (
                      SELECT
                        {cset_id} AS cset_id,
                        family_id,
                        priority_year,
                        assignee
                      FROM
                        `gcp-cset-projects.ai_companies_visualization.no_grid_ai_patents`),
                      -- Now we want to combine the AI patents from Dimensions' current assignees, the AI patents from Dimensions' original assignees,
                      -- And the AI patents from 1790 analytics. We use simple_family_id as our unit of counting
                      combined_patent_list AS (
                      SELECT
                        DISTINCT family_id,
                        priority_year
                      FROM
                        -- Get our specific grid ids
                        specific_id_grid
                      INNER JOIN
                        -- Get all the AI patents with current assignees who have those grids
                        ai_pats
                      ON
                        specific_id_grid.grids = ai_pats.grid
                      UNION DISTINCT
                      SELECT
                        DISTINCT family_id,
                        priority_year,
                      FROM
                        -- Get all no_grid patents
                        ai_no_grid_patents
                      LEFT JOIN
                        -- Get our specific grid id and regex
                        specific_id_grid
                      ON
                        ai_no_grid_patents.cset_id = specific_id_grid.id
                        -- Narrow to only the patents whose assignee matches the company regex
                      WHERE
                        REGEXP_CONTAINS(LOWER(assignee), specific_id_grid.regexes))
                    SELECT
                      STRUCT(priority_year,
                        COUNT(DISTINCT family_id) AS ai_patents) AS ai_patents_by_year
                    FROM
                      combined_patent_list
                    GROUP BY
                      priority_year
                    ORDER BY
                      priority_year"""
        client = bigquery.Client()
        query_job = client.query(query)
        by_year = [row["ai_patents_by_year"] for row in query_job]
        return by_year

    def run_query_id_patents(self):
        patent_companies = []
        for cset_id in self.company_ids:
            if cset_id in self.regex_dict:
                query = f"""WITH
                              -- First we pull all the CSET ids and their associated grids
                              id_grid AS (
                              SELECT
                                DISTINCT CSET_id AS id,
                                grids,
                                regexes
                              FROM
                                -- from the aggregated organizations table
                                `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
                                -- Adding in the associated grids
                              LEFT JOIN
                                UNNEST(grid) AS grids
                              CROSS JOIN
                                UNNEST(regex) AS regexes),
                              -- Then we get the data for the specific CSET id we want
                              specific_id_grid AS (
                              SELECT
                                id,
                                grids,
                                regexes
                              FROM
                                id_grid
                                -- The specific CSET id goes here
                              WHERE
                                id = {cset_id}),
                              -- Now we pull all the AI-specific dimensions patents by grid id, simple family id, and org name
                              -- Our goal here is to be able to count every family of patents that has an assignee with a grid associated to our CSET id
                              -- We use both current and original assignee because we're interested in if a company had a patent initially or if they acquired one/acquired a company with one
                              ai_no_grid_patents AS (
                              SELECT
                                {cset_id} AS cset_id,
                                *
                              FROM
                                `gcp-cset-projects.ai_companies_visualization.no_grid_ai_patents`)
                              -- Now we want to combine the AI patents from Dimensions' current assignees, the AI patents from Dimensions' original assignees,
                              -- And the AI patents from 1790 analytics. We use simple_family_id as our unit of counting
                              SELECT
                                DISTINCT family_id,
                                priority_year,
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
                                Control, Distributed_AI,
                                Robotics,
                                Computer_Vision,
                                Analytics_and_Algorithms,
                                Measuring_and_Testing,
                                Logic_Programming,
                                Fuzzy_Logic,
                                Probabilistic_Reasoning,
                                Ontology_Engineering,
                                Machine_Learning,
                                Search_Methods
                              FROM
                                -- Get our specific grid ids
                                specific_id_grid
                              INNER JOIN
                                -- Get all the AI patents with current assignees who have those grids
                                `gcp-cset-projects.ai_companies_visualization.grid_ai_patents` as grid_pat
                              ON
                                specific_id_grid.grids = grid_pat.grid
                              WHERE priority_year IS NOT NULL
                              UNION DISTINCT
                              SELECT
                                DISTINCT family_id,
                                priority_year,
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
                                Control, Distributed_AI,
                                Robotics,
                                Computer_Vision,
                                Analytics_and_Algorithms,
                                Measuring_and_Testing,
                                Logic_Programming,
                                Fuzzy_Logic,
                                Probabilistic_Reasoning,
                                Ontology_Engineering,
                                Machine_Learning,
                                Search_Methods
                              FROM
                                -- Get all no_grid patents
                                ai_no_grid_patents
                              LEFT JOIN
                                -- Get our specific grid id and regex
                                specific_id_grid
                              ON
                                ai_no_grid_patents.cset_id = specific_id_grid.id
                                -- Narrow to only the patents whose assignee matches the company regex
                              WHERE
                                REGEXP_CONTAINS(LOWER(assignee), specific_id_grid.regexes)
                                AND priority_year IS NOT NULL"""
                client = bigquery.Client()
                query_job = client.query(query)
                for row in query_job:
                    new_patent_row = {"CSET_id": cset_id, "family_id": row["family_id"], "priority_year": row["priority_year"]}
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
            out.write(json.dumps(row) + "\n")
        out.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_papers", type=str, help="A jsonl file for writing output paper data to create new tables")
    parser.add_argument("output_patents", type=str, help="A jsonl file for writing output patent data to create new tables")
    args = parser.parse_args()
    if "jsonl" not in args.output_papers or "jsonl" not in args.output_patents:
        parser.print_help()
    count_getter = CountGetter()
    print("Fetching regular expressions")
    count_getter.get_regex()
    table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
    print("Fetching paper data")
    company_rows = count_getter.run_query_id_papers(table_name)
    print("Writing results")
    count_getter.write_output(company_rows, args.output_papers)
    # companies = count_getter.run_query_papers(table_name, "ai_pubs", by_year=True)
    print("Fetching patent data")
    patent_companies = count_getter.run_query_id_patents()
    # companies = count_getter.run_query_patents(companies)
    print("Writing results")
    count_getter.write_output(patent_companies, args.output_patents)
    # count_getter.write_output(companies)

if __name__ == "__main__":
    main()