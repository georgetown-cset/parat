CREATE OR REPLACE TABLE
  ai_companies_visualization.pubs_in_top_conferences AS
WITH
  -- Associating GRIDs to the merged paper ids
  affils AS (
  SELECT
    merged_id,
    org_name,
    grid_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`
    WHERE org_name IS NOT NULL OR grid_id IS NOT NULL),
  -- Associating GRID organizational information to the GRIDs, for consistent naming and locational information
  grid_data AS (
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid)
  -- For every paper that was published at a top AI conference, we want its paper id, its grid, and its grid-base org name
SELECT
  DISTINCT
  top_pubs.merged_id,
  COALESCE(grid_data.org_name, affils.org_name) as org_name,
  grid_id,
  year
FROM
  ai_companies_visualization.top_conference_pubs AS top_pubs
  -- We're inner joining because if there's no affiliate information at all we have no way to even evaluate this data for our purposes
INNER JOIN
  affils
ON
  top_pubs.merged_id = affils.merged_id
LEFT JOIN
  grid_data
ON
  affils.Grid_ID = grid_data.id
GROUP BY
  Grid_ID,
  org_name,
  top_pubs.merged_id,
  year