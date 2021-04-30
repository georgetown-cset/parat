-- This query pulls the initial visualization data for the table that doesn't have to be compiled (as it's already
-- available in the organizations table) and adds in the GRID-based AI publication counts.


CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    Grid_ID,
    merged_id
  FROM
    ai_companies_visualization.grid_ai_publications),
  organization_grids AS (
  -- Getting all grids associated with any CSET id for an organization
  SELECT
    DISTINCT CSET_id AS id,
    grids
  FROM
    -- From either the organizations table
    `gcp-cset-projects.high_resolution_entities.aggregated_organizations`,
    UNNEST(grid) AS grids),
  id_grid AS ( (
    SELECT
      id,
      grid
    FROM
      -- or from the identifier_grid table
      ai_companies_identification.identifiers_grid_augmented)
  UNION DISTINCT
  SELECT
    *
  FROM
    organization_grids),
  gridtable AS (
    -- Getting the count of publications
  SELECT
    id,
    COUNT(DISTINCT merged_id) AS ai_pubs
  FROM ( id_grid
    INNER JOIN
      aipubs
    ON
      id_grid.grid = aipubs.Grid_ID )
  GROUP BY
    id)
  -- Pulling all the columns we care about that are already in the aggregated organizations table, plus ai_pubs
SELECT
  CSET_id,
  name,
  location.country AS country,
  aliases,
  parent,
  children,
  non_agg_children,
  permid,
  website,
  market,
  crunchbase,
  child_crunchbase,
  grid,
  ai_pubs
FROM
  `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS orgs
LEFT JOIN
  gridtable
ON
  orgs.CSET_id = gridtable.id