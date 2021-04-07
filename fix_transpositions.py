from google.cloud import bigquery
import csv
import argparse
from collections import defaultdict

def get_transposed(csv_file):
    """
    Pulling which exchange/ticker pairs are transposed from csv
    :param csv_file:
    :return:
    """
    transpositions = defaultdict(list)
    with open(csv_file, 'r') as in_csv:
        reader = csv.DictReader(in_csv)
        for row in reader:
            if row["transposed"] == "1":
                transpositions[int(row["cset_id"])].append((row["markets.ticker"], row["markets.exchange"]))
    return transpositions

def get_all_market(transpositions):
    """
    Getting all market data for every organization, either aggregated or not.
    We only care about market data if any market pair is transposed.
    We just build the queries to get market data here, and then run them in do_market_query
    :param transpositions: The set of orgs with transpositions.
    :return:
    """
    org_query = """SELECT cset_id, market.exchange as exchange, market.ticker as ticker FROM 
    `gcp-cset-projects.high_resolution_entities.organizations`
    CROSS JOIN UNNEST(market) as market order by cset_id"""
    aggregated_org_query = """SELECT cset_id, market.exchange as exchange, market.ticker as ticker FROM 
    `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
    CROSS JOIN UNNEST(market) as market order by cset_id"""
    organizations_market = do_market_query(org_query, transpositions)
    aggregated_organizations_market = do_market_query(aggregated_org_query, transpositions)
    return organizations_market, aggregated_organizations_market


def do_market_query(org_query, transpositions):
    """
    Running the query that actually pulls market data for organizations
    :param org_query: The query to run, either in organizations or aggregated_organizations
    :param transpositions: This set of orgs with transposed market pairs
    :return:
    """
    organizations_market = defaultdict(set)
    client = bigquery.Client()
    query_job = client.query(org_query)
    for row in query_job:
        # if this is a cset id that has a transposition, we care
        if row["cset_id"] in transpositions:
            no_include = False
            # check to see if the current exchange we're looking at is one that was transposed to a ticker; if not add
            for transposition in transpositions[row["cset_id"]]:
                # if the exchange equals a ticker
                if row["exchange"] == transposition[1]:
                    no_include = True
                    organizations_market[row["cset_id"]].add(transposition)
            if not no_include:
                organizations_market[row["cset_id"]].add((row["exchange"], row["ticker"]))
    return organizations_market


def make_organization_sql(cset_id, market):
    """
    Making the sql queries to update the organization table to fix the transpositions
    :param cset_id: CSET id of the org with transposed data
    :param market: All market pairs for the org
    :return:
    """
    elem = ""
    for market_elem in market:
        elem += f"""STRUCT("{market_elem[0]}" as exchange, "{market_elem[1]}" as ticker), """
    elem = elem[:-2] # get rid of final ", "
    query = f"""CREATE OR REPLACE TABLE
                `gcp-cset-projects.high_resolution_entities.organizations` AS
                WITH
                  company AS (
                  SELECT
                    CSET_id,
                    name,
                    location,
                    website,
                    aliases,
                    parent,
                    permid,
                    [{elem}] as market,
                    crunchbase,
                    grid,
                    regex,
                    BGOV_id,
                    comment
                  FROM
                    `gcp-cset-projects.high_resolution_entities.organizations`
                  WHERE
                    CSET_id = {cset_id}),
                  the_rest AS (
                  SELECT
                    *
                  FROM
                    `gcp-cset-projects.high_resolution_entities.organizations`
                  WHERE
                    CSET_id != {cset_id})
                SELECT
                  *
                FROM
                  company
                UNION ALL
                SELECT
                  *
                FROM
                  the_rest
                ORDER BY
                  CSET_id"""
    print(query + "\n")

def make_aggregated_org_sql(cset_id, market):
    """
    Making the sql queries to update the aggregated organization table to fix the transpositions
    :param cset_id: CSET id of the org with transposed data
    :param market: All market pairs for the org
    :return:
    """
    elem = ""
    for market_elem in market:
        elem += f"""STRUCT("{market_elem[0]}" as exchange, "{market_elem[1]}" as ticker), """
    elem = elem[:-2]  # get rid of final ", "
    query = f"""CREATE OR REPLACE TABLE
                `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS
                WITH
                  company AS (
                  SELECT
                    CSET_id,
                    name,
                    location,
                    website,
                    aliases,
                    parent,
                    permid,
                    [{elem}] as market,
                    crunchbase,
                    child_crunchbase,
                    grid,
                    regex,
                    BGOV_id,
                    comment,
                    children,
                    non_agg_children
                  FROM
                    `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
                  WHERE
                    CSET_id = {cset_id}),
                  the_rest AS (
                  SELECT
                    *
                  FROM
                    `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
                  WHERE
                    CSET_id != {cset_id})
                SELECT
                  *
                FROM
                  company
                UNION ALL
                SELECT
                  *
                FROM
                  the_rest
                ORDER BY
                  CSET_id"""
    print(query + "\n")

def make_visualization_sql(cset_id, market):
    """
    Making the sql queries to update the visualization data table to fix the transpositions
    :param cset_id: CSET id of the org with transposed data
    :param market: All market pairs for the org
    :return:
    """
    elem = ""
    for market_elem in market:
        elem += f"""STRUCT("{market_elem[0]}" as exchange, "{market_elem[1]}" as ticker), """
    elem = elem[:-2]  # get rid of final ", "
    query = f"""CREATE OR REPLACE TABLE
                    `gcp-cset-projects.ai_companies_visualization.visualization_data` AS
                    WITH
                      company AS (
                      SELECT
                        CSET_id,
                        name,
                        country,
                        aliases,
                        parent,
                        children,
                        non_agg_children,
                        permid,
                        website,
                        [{elem}] as market,
                        crunchbase,
                        child_crunchbase,
                        grid,
                        ai_pubs,
                        ai_pubs_by_year,
                        ai_patents,
                        ai_patents_by_year,
                        ai_pubs_in_top_conferences,
                        ai_pubs_in_top_conferences_by_year
                      FROM
                        `gcp-cset-projects.ai_companies_visualization.visualization_data`
                      WHERE
                        CSET_id = {cset_id}),
                      the_rest AS (
                      SELECT
                        *
                      FROM
                        `gcp-cset-projects.ai_companies_visualization.visualization_data`
                      WHERE
                        CSET_id != {cset_id})
                    SELECT
                      *
                    FROM
                      company
                    UNION ALL
                    SELECT
                      *
                    FROM
                      the_rest
                    ORDER BY
                      CSET_id"""
    print(query + "\n")



def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("csv", type=str, help="A csv file containing transpositions")
    args = parser.parse_args()
    if "csv" not in args.csv:
        parser.print_help()
    transpositions = get_transposed(args.csv)
    organizations_market, aggregate_organizations_market = get_all_market(transpositions)
    for i in organizations_market.keys():
        make_organization_sql(i, organizations_market[i])
    for i in aggregate_organizations_market.keys():
        make_aggregated_org_sql(i, aggregate_organizations_market[i])
    for i in aggregate_organizations_market.keys():
        make_visualization_sql(i, aggregate_organizations_market[i])



if __name__ == "__main__":
    main()