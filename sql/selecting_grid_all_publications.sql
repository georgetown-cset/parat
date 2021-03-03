  -- Pulling every publication id linked to every grid id of any author affiliate for that publication
  -- We want this because when we count all publications later on, our count will be "for each grid id, how
  -- many publication IDs exist?" That is, we'll count publications multiple times if they have multiple affiliations
  -- but not multiple times if they have multiple authors with the same affiliation. Creating this table makes that easy!
  -- We also include years because we'll want those later for yearly counts
CREATE OR REPLACE TABLE
  ai_companies_visualization.grid_all_publications AS
WITH
  gr AS (
    -- Adding in org names and country data using GRID
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid),
  merged_grids AS (
    -- Selecting all the merged ids and grid ids from the links table
  SELECT
    merged_id,
    grid_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`),
  arts AS (
  SELECT
    -- Distincting on the merged publication id and the grid id so each paper is only listed with each affiliation once
    -- but is listed multiple times if it has multiple distinct affiliations
    DISTINCT merged_id,
    grid_id
  FROM
    merged_grids
  GROUP BY
    Grid_ID,
    merged_id),
  article_years AS (
  SELECT
    merged_id,
    year
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.corpus_merged`)
SELECT
  -- Adding in the org name and country associated with the grid id
  arts.*,
  org_name,
  country,
  year
FROM
  arts
LEFT JOIN
  gr
ON
  arts.Grid_ID = gr.id
LEFT JOIN
  article_years
ON
  arts.merged_id = article_years.merged_id