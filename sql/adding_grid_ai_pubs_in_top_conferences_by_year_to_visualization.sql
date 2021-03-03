-- Add the publications in top conferences by year to our visualization data, if they have a grid.
-- We'll add the other ones later!
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
-- Pull the grid and paper ids for all top conference publications with grid
WITH
  top_conf_pubs AS (
  SELECT
    grid_id,
    merged_id,
    year
  FROM
    `gcp-cset-projects.ai_companies_visualization.pubs_in_top_conferences_grid`),
  -- Pull the grids and CSET organization ids for all organizations
  organization_grids AS (
  SELECT
    CSET_id,
    grids
  FROM
    `gcp-cset-projects.ai_companies_visualization.visualization_data`
  -- Unnest the grids so we can link them to the paper data
  CROSS JOIN
    UNNEST(grid) AS grids),
  -- Link the publication data to the CSET organization ids of the org it was published by, using its GRID
  pubs_by_organization AS (
  SELECT
    CSET_id,
    grids,
    merged_id,
    year
  FROM
    organization_grids
  INNER JOIN
    top_conf_pubs
  ON
    grids=grid_id),
  -- Count all the papers in top conferences for any given CSET organization id, keeping it separate by year
  paper_counts AS (
  SELECT
    CSET_id,
    year,
    COUNT(DISTINCT merged_id) AS ai_pubs_in_top_conferences
  FROM
    pubs_by_organization
  GROUP BY
    CSET_id, year),
-- Aggregate the by year data into an array
by_year as (
SELECT
CSET_id,
ARRAY_AGG(STRUCT(year, ai_pubs_in_top_conferences)
ORDER BY year) as ai_pubs_in_top_conferences_by_year
FROM paper_counts
GROUP BY CSET_id)
-- Link the results back to the full visualization data table using the CSET organization id
SELECT
  visualization_data.*,
  ai_pubs_in_top_conferences_by_year
FROM
  ai_companies_visualization.visualization_data
LEFT JOIN
  by_year
ON
  visualization_data.CSET_id = by_year.CSET_id