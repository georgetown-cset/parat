import argparse
import pandas as pd
import json

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
        self.regex_dict = {}

    def get_regex(self) -> None:
        """
        Pulling the regular expressions used to find papers and patents through means other than GRID.
        :return:
        """
        regex_query = """SELECT CSET_id, regex FROM `gcp-cset-projects.high_resolution_entities.organizations`"""
        client = bigquery.Client()
        query_job = client.query(regex_query)
        regexes = query_job.result()
        for regex_result in regexes:
            if regex_result.regex:
                self.regex_dict[regex_result.CSET_id] = regex_result.regex

    def run_query_papers(self, table_name: str, field_name: str, test: bool = False) -> list:
        """
        Running a query to find paper counts using regex for papers missing GRID. This query combines
        this data with preexisting paper counts already identified using SQL for papers that have GRID.
        :param table_name: The table to look for papers in
        :param field_name: The json field name
        :param test: False if not running as a unit test
        :return:
        """
        companies_query = f"""SELECT CSET_id, grid, {field_name}
                                FROM `gcp-cset-projects.ai_companies_visualization.visualization_data`"""
        if test:
            companies_query += """ LIMIT 10"""
        client = bigquery.Client()
        query_job = client.query(companies_query)
        companies = []
        for row in query_job:
            row_dict = {"CSET_id": row["CSET_id"], field_name: row[field_name]}
            # if we don't already have the publication count but we do have a regex to find it
            if not row[field_name]:
                if row["CSET_id"] not in self.regex_dict:
                    # if it's not in the regex_dict or in ai_pubs but also has no grid, that's bad
                    if not row["grid"]:
                        print(row["CSET_id"])
                    else:
                        # in this case, it has a grid but it's AI publication count is 0
                        row_dict[field_name] = 0
                else:
                    regex_to_use = rf"r'(?i){self.regex_dict[row['CSET_id']]}'"
                    query = f"SELECT merged_id, org_names FROM `{table_name}`" \
                            f" WHERE regexp_contains(org_names, {regex_to_use}) "
                    results = pd.read_gbq(query, project_id='gcp-cset-projects')
                    row_dict[field_name] = int(results["merged_id"].nunique())
            companies.append(row_dict)
        return companies

    def run_query_patents(self, companies: list) -> list:
        """
        Running a query to find AI patent counts using both Dimensions and 1790 for papers with and without GRID.
        :param companies: The list of company entries with CSET ids that we want to count patents for
        :return:
        """
        for company in companies:
            if company["CSET_id"] in self.regex_dict:
                regex_to_use = rf"r'(?i){self.regex_dict[company['CSET_id']]}'"
                query = f"""WITH
                              -- First we pull all the CSET ids and their associated grids
                              id_grid AS ((
                                  -- Getting all grids associated with CSET ids for a organizations
                                SELECT
                                  id,
                                  grid,
                                  -- There aren't regexes in this dataset, but we still want to pull grids so we include it anyway
                                  NULL AS regex
                                FROM
                                  -- from either the identifier_grid table
                                  ai_companies_draft_052020.identifiers_grid_augmented)
                              UNION DISTINCT (
                                SELECT
                                  DISTINCT CSET_id AS id,
                                  grids,
                                  {regex_to_use} AS regex
                                FROM
                                  -- or from the organizations table
                                  `gcp-cset-projects.high_resolution_entities.organizations`
                                  -- Adding in the associated grids
                                CROSS JOIN
                                  UNNEST(grid) AS grids )),
                              -- Then we get the data for the specific CSET id we want
                              specific_id_grid AS (
                              SELECT
                                id,
                                grid,
                                regex
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
                                UNNEST(Assignees) AS assignee)
                            -- Now we want to combine the AI patents from Dimensions' current assignees, the AI patents from Dimensions' original assignees,
                            -- And the AI patents from 1790 analytics. We use simple_family_id as our unit of counting
                            SELECT
                              DISTINCT Simple_family_id
                            FROM
                            -- Get our specific grid ids
                              specific_id_grid
                            INNER JOIN
                            -- Get all the AI patents with current assignees who have those grids
                              ai_pats_dimensions_curr
                            ON
                              specific_id_grid.grid = ai_pats_dimensions_curr.current_grid_id
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
                              specific_id_grid.grid = ai_pats_dimensions_orig.original_grid_id
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
                              REGEXP_CONTAINS(assignee, specific_id_grid.regex)"""
                results = pd.read_gbq(query, project_id='gcp-cset-projects')
                company["ai_patents"] = int(results["Simple_family_id"].count())
            else:
                print(company["id"])
                company["ai_patents"] = None
        return companies

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
    count_getter.get_regex()
    table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
    companies = count_getter.run_query_papers(table_name, "ai_pubs")
    companies = count_getter.run_query_patents(companies)
    count_getter.write_output(companies)

if __name__ == "__main__":
    main()