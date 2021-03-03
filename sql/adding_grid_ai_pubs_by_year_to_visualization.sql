-- Adding GRID-only AI publication data by year to the visualization table
-- This uses the same mechanism as adding GRID-only AI publication counts; we're just doing it on a by-year basis
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    Grid_ID,
    merged_id,
    year
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
    year,
    COUNT(DISTINCT merged_id) AS ai_pubs
  FROM ( id_grid
    INNER JOIN
      aipubs
    ON
      id_grid.grid = aipubs.Grid_ID )
  GROUP BY
    id,
    year),
  -- Aggregating the by-year data so it's all in one field
  by_year AS (
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(year,
        ai_pubs)
    ORDER BY
      year) AS ai_pubs_by_year
  FROM
    `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS orgs
  LEFT JOIN
    gridtable
  ON
    orgs.CSET_id = gridtable.id
  GROUP BY
    CSET_id)
SELECT
  viz.*,
  ai_pubs_by_year
FROM
  `gcp-cset-projects.ai_companies_visualization.visualization_data` AS viz
LEFT JOIN
  by_year
ON
  viz.CSET_id = by_year.CSET_id