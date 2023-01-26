-- DEPRECATED, DELETE WHEN READY
CREATE OR REPLACE TABLE
  ai_companies_visualization.pubs_in_top_conferences_no_grid AS
WITH
  -- Associating GRIDs to the merged paper ids
  affils AS (
  SELECT
    merged_id,
    org_name AS raw_org_name,
    grid_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`),
  -- Associating GRID organizational information to the GRIDs, for consistent naming and locational information
  grid_data AS (
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid),
  -- We're grouping papers by grid here because we want to exclude all the paper-grid pairs that have a non-null GRID since those will have been included in the with-grid table.
  -- We're not concerned about excluding papers that have grid, though (in fact, we don't want to) because some papers may have an affiliate with GRID and an affiliate without and we
  -- want to include them under both. And we're only querying with regex for affiliates that don't have GRID so we won't double-count.
  papers_grouped_by_grid AS (
  SELECT
    -- We're aggregating with ^ because it doesn't show up in the org names. This doesn't matter much because we're just searching with regex, but we don't want to introduce anything.
    STRING_AGG(raw_org_name, "^") AS org_names,
    top_pubs.merged_id,
    grid_id,
    year
  FROM
    ai_companies_visualization.top_conference_pubs AS top_pubs
  INNER JOIN
    affils
  ON
    top_pubs.merged_id = affils.merged_id
  GROUP BY
    grid_id,
    top_pubs.merged_id,
    year)
  -- Now we take out the GRIDS and only include the rows where the GRIDs are null.
SELECT
  merged_id,
  org_names,
  year
FROM
  papers_grouped_by_grid
WHERE
  grid_id IS NULL
  OR grid_id = ""