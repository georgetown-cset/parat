-- Adding GRID-only total publication data by year to the visualization table
-- This uses the same mechanism as adding GRID-only total publication counts; we're just doing it on a by-year basis
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
WITH
  allpubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    Grid_ID,
    merged_id,
    year
  FROM
    ai_companies_visualization.grid_all_publications),
  organization_grids AS (
    -- Getting all grids associated with any CSET id for an organization
  SELECT
    DISTINCT CSET_id AS id,
    grids
  FROM
    -- From either the organizations table
    `gcp-cset-projects.high_resolution_entities.aggregated_organizations`
   CROSS JOIN
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
    id as CSET_id,
    COUNT(DISTINCT merged_id) AS all_pubs
  FROM ( id_grid
    INNER JOIN
      allpubs
    ON
      id_grid.grid = allpubs.Grid_ID )
  GROUP BY
    id)
SELECT
  viz.*,
  all_pubs
FROM
  `gcp-cset-projects.ai_companies_visualization.visualization_data` AS viz
LEFT JOIN
  gridtable
ON
  viz.CSET_id = gridtable.CSET_id