import argparse
import json
from collections import defaultdict

from google.cloud import bigquery


class CountGetter:

    def __init__(self, output_file: str) -> None:
        """
        CountGetter is intended to get counts of various things; currently it is able to
        count papers (from any dataset correctly configured, so it can count AI papers,
        AI papers in top conferences, etc.) and AI patents (from Dimensions and 1790 jointly).
        :type output_file: str
        """
        self.output_file = output_file
        self.regex_dict = defaultdict(list)

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
        table_name: The table to look for papers in
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
                    regex_to_use = rf"r'(?i){regexes[0]}'"
                    query = f"SELECT COUNT(DISTINCT merged_id) as paper_count FROM `{table_name}`" \
                            f" WHERE regexp_contains(org_names, {regex_to_use}) "
                    # if we have more than one regex for an org, include all of them
                    if len(regexes) > 1:
                        for regex in regexes[1:]:
                            regex_to_use = rf"r'(?i){regex}'"
                            query += f"""OR regexp_contains(org_names, {regex_to_use}) """
                    # results = pd.read_gbq(query, project_id='gcp-cset-projects')
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
        regex_to_use = rf"r'(?i){regexes[0]}'"
        query = f"""SELECT
                      STRUCT(year,
                        COUNT(merged_id) AS {field_name}) AS {field_name_by_year}
                    FROM
                      `{table_name}`
                    WHERE
                      REGEXP_CONTAINS(org_names, {regex_to_use}) """
        if len(regexes) > 1:
            for regex in regexes[1:]:
                regex_to_use = rf"r'(?i){regex}'"
                query += f"""OR regexp_contains(org_names, {regex_to_use}) """
        query += """GROUP BY year ORDER BY year"""
        client = bigquery.Client()
        query_job = client.query(query)
        by_year = [row[field_name_by_year] for row in query_job]
        return by_year


    def run_query_patents(self, companies: list) -> list:
        """
        Running a query to find AI patent counts using both Dimensions and 1790 for papers with and without GRID.
        :param companies: The list of company entries with CSET ids that we want to count patents for
        :return:
        """
        for company in companies:
            if company["CSET_id"] in self.regex_dict:
                # regex_to_use = rf"r'(?i){self.regex_dict[company['CSET_id']]}'"
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
                              CROSS JOIN
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
                              ai_pats_dimensions_curr AS (
                              SELECT
                                current_grid_id,
                                Simple_family_id,
                                org_name
                              FROM
                                `gcp-cset-projects.ai_companies_visualization.grid_ai_patents_current_assignee` ),
                              -- Adding in the original assignees as well
                              ai_pats_dimensions_orig AS (
                              SELECT
                                original_grid_id,
                                Simple_family_id,
                                org_name
                              FROM
                                `gcp-cset-projects.ai_companies_visualization.grid_ai_patents_original_assignee` ),
                              -- Pulling in the AI patents from 1790 analytics
                              ai_pats_1790 AS (
                              SELECT
                                -- We specify the id here to make joins easy; this is kind of a bad cheat but it works
                                {company["CSET_id"]} AS id,
                                simple_family_id,
                                assignee
                              FROM
                                `gcp-cset-projects.1790_patents.1790_ai_patents_all_quantitative_information`
                                -- Adding in the patent assignees so we can search them with regex later
                              CROSS JOIN
                                UNNEST(Assignees) AS assignee),
                              -- Now we want to combine the AI patents from Dimensions' current assignees, the AI patents from Dimensions' original assignees,
                              -- And the AI patents from 1790 analytics. We use simple_family_id as our unit of counting
                              combined_patent_list AS (
                              SELECT
                                DISTINCT Simple_family_id
                              FROM
                                -- Get our specific grid ids
                                specific_id_grid
                              INNER JOIN
                                -- Get all the AI patents with current assignees who have those grids
                                ai_pats_dimensions_curr
                              ON
                                specific_id_grid.grids = ai_pats_dimensions_curr.current_grid_id
                              UNION DISTINCT
                              SELECT
                                DISTINCT Simple_family_id
                              FROM
                                -- Get our specific grid ids
                                specific_id_grid
                              INNER JOIN
                                -- Get all the AI patents with original assignees who have those grids
                                ai_pats_dimensions_orig
                              ON
                                specific_id_grid.grids = ai_pats_dimensions_orig.original_grid_id
                              UNION DISTINCT
                              SELECT
                                DISTINCT Simple_family_ID
                              FROM
                                -- Get all 1790 patents
                                ai_pats_1790
                              LEFT JOIN
                                -- Get our specific grid id and regex
                                specific_id_grid
                              ON
                                ai_pats_1790.id = specific_id_grid.id
                                -- Narrow to only the patents whose assignee matches the company regex
                              WHERE
                                REGEXP_CONTAINS(LOWER(assignee), specific_id_grid.regexes))
                            SELECT
                              COUNT(DISTINCT Simple_family_ID) AS ai_patents
                            FROM
                              combined_patent_list"""
                client = bigquery.Client()
                query_job = client.query(query)
                # results = pd.read_gbq(query, project_id='gcp-cset-projects')
                # company["ai_patents"] = int(results["Simple_family_id"].count())
                for row in query_job:
                    company["ai_patents"] = row["ai_patents"]
                company["ai_patents_by_year"] = self.run_query_patents_by_year(company["CSET_id"])
            else:
                print(company["id"])
                company["ai_patents"] = None
                company["ai_patents_by_year"] = []
        return companies

    def run_query_patents_by_year(self, cset_id: int):
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
                      CROSS JOIN
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
                      ai_pats_dimensions_curr AS (
                      SELECT
                        current_grid_id,
                        Simple_family_id,
                        priority_year,
                        org_name
                      FROM
                        `gcp-cset-projects.ai_companies_visualization.grid_ai_patents_current_assignee` ),
                      -- Adding in the original assignees as well
                      ai_pats_dimensions_orig AS (
                      SELECT
                        original_grid_id,
                        Simple_family_id,
                        priority_year,
                        org_name
                      FROM
                        `gcp-cset-projects.ai_companies_visualization.grid_ai_patents_original_assignee` ),
                      -- Pulling in the AI patents from 1790 analytics
                      ai_pats_1790 AS (
                      SELECT
                        -- We specify the id here to make joins easy; this is kind of a bad cheat but it works
                        {cset_id} AS id,
                        simple_family_id,
                        EXTRACT(year
                        FROM
                          First_priority_date) AS priority_year,
                        assignee
                      FROM
                        `gcp-cset-projects.1790_patents.1790_ai_patents_all_quantitative_information`
                        -- Adding in the patent assignees so we can search them with regex later
                      CROSS JOIN
                        UNNEST(Assignees) AS assignee),
                      -- Now we want to combine the AI patents from Dimensions' current assignees, the AI patents from Dimensions' original assignees,
                      -- And the AI patents from 1790 analytics. We use simple_family_id as our unit of counting
                      combined_patent_list AS (
                      SELECT
                        DISTINCT Simple_family_id,
                        priority_year
                      FROM
                        -- Get our specific grid ids
                        specific_id_grid
                      INNER JOIN
                        -- Get all the AI patents with current assignees who have those grids
                        ai_pats_dimensions_curr
                      ON
                        specific_id_grid.grids = ai_pats_dimensions_curr.current_grid_id
                      UNION DISTINCT
                      SELECT
                        DISTINCT Simple_family_id,
                        priority_year
                      FROM
                        -- Get our specific grid ids
                        specific_id_grid
                      INNER JOIN
                        -- Get all the AI patents with original assignees who have those grids
                        ai_pats_dimensions_orig
                      ON
                        specific_id_grid.grids = ai_pats_dimensions_orig.original_grid_id
                      UNION DISTINCT
                      SELECT
                        DISTINCT Simple_family_ID,
                        priority_year
                      FROM
                        -- Get all 1790 patents
                        ai_pats_1790
                      LEFT JOIN
                        -- Get our specific grid id and regex
                        specific_id_grid
                      ON
                        ai_pats_1790.id = specific_id_grid.id
                        -- Narrow to only the patents whose assignee matches the company regex
                      WHERE
                        REGEXP_CONTAINS(LOWER(assignee), specific_id_grid.regexes))
                    SELECT
                      STRUCT (priority_year,
                      COUNT(Simple_family_ID) AS ai_patents) as ai_patents_by_year
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

    def write_output(self, companies: list) -> None:
        """
        Write output to jsonl
        :param companies: The list of company data to write out
        :return:
        """
        out = open(self.output_file, "w")
        for row in companies:
            out.write(json.dumps(row) + "\n")
        out.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_file", type=str, help="A jsonl file for writing output data to create new tables")
    args = parser.parse_args()
    if "jsonl" not in args.output_file:
        parser.print_help()
    count_getter = CountGetter(args.output_file)
    print("Fetching regular expressions")
    count_getter.get_regex()
    table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
    print("Fetching paper data")
    companies = count_getter.run_query_papers(table_name, "ai_pubs", by_year=True)
    print("Fetching patent data")
    companies = count_getter.run_query_patents(companies)
    print("Writing results")
    count_getter.write_output(companies)

if __name__ == "__main__":
    main()