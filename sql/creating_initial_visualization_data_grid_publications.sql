-- This query pulls the initial visualization data for the table that doesn't have to be compiled (as it's already
-- available in the organizations table) and adds in the GRID-based AI publication counts.


CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
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
  grid,
  ai_pubs
FROM
  `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS orgs
LEFT JOIN (
    -- Getting the count of publications
  SELECT
    id,
    COUNT(DISTINCT merged_id) AS ai_pubs
  FROM ( ((
          -- Getting all grids associated with any CSET id for an organization
        SELECT
          id,
          grid
        FROM
          -- from either the identifier_grid table
          ai_companies_identification.identifiers_grid_augmented)
      UNION DISTINCT (
        SELECT
          DISTINCT CSET_id AS id,
          grids
        FROM
          -- or from the organizations table
          `gcp-cset-projects.high_resolution_entities.aggregated_organizations`,
          UNNEST(grid) AS grids)) AS id_grid
    INNER JOIN (
        -- Pulling all the papers with any of the given GRIDs as affiliates
      SELECT
        Grid_ID,
        merged_id
      FROM
        ai_companies_visualization.grid_ai_publications ) AS aipubs
    ON
      id_grid.grid = aipubs.Grid_ID )
  GROUP BY
    id) AS gridtable
ON
  orgs.CSET_id = gridtable.id