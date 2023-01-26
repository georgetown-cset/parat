  -- Pulling every publication id linked to every author affiliate and all years because we'll want those later for yearly counts
CREATE OR REPLACE TABLE
  ai_companies_visualization.all_publications AS
WITH
  gr AS (
    -- Adding in org names and country data using GRID
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid),
  arts AS (
    -- Selecting all the merged ids and affiliations from the links table
  SELECT
    DISTINCT
    merged_id,
    org_name,
    grid_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`
    WHERE org_name IS NOT NULL OR grid_id IS NOT NULL),
  article_years AS (
  SELECT
    merged_id,
    year
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.corpus_merged`)
SELECT
  -- Adding in the org name and country associated with the grid id
  arts.* EXCEPT (org_name),
  COALESCE(gr.org_name, arts.org_name) as org_name,
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