-- Pulling all AI-related publications based on their CSET ids, if they have GRIDs.
-- We'll add in the ones that don't have GRIDs later!
CREATE OR REPLACE TABLE
  ai_companies_visualization.ai_company_pubs AS
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    Grid_ID,
    merged_id,
    year,
    cv,
    nlp,
    robotics
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
      grid,
    FROM
      -- or from the identifier_grid table
      ai_companies_identification.identifiers_grid_augmented)
  UNION DISTINCT
  SELECT
    *
  FROM
    organization_grids)
    -- Getting the count of publications
  SELECT
  DISTINCT
    id,
    merged_id,
    year,
    cv,
    nlp,
    robotics
  FROM ( id_grid
    INNER JOIN
      aipubs
    ON
      id_grid.grid = aipubs.Grid_ID )
      ORDER BY id