-- Pulling every AI-associated publication id linked to every grid id of any author affiliate for that publication
-- We want this because when we count AI publications later on, our count will be "for each grid id, how
-- many publication IDs exist?" That is, we'll count publications multiple times if they have multiple affiliations
-- but not multiple times if they have multiple authors with the same affiliation. Creating this table makes that easy!
create or replace table ai_companies_visualization.grid_ai_publications as
SELECT
-- Adding in the org name and country associated with the grid id
  ai_arts.*,
  org_name,
  country
FROM (
  SELECT
  -- Distincting on the merged publication id and the grid id so each paper is only listed with each affiliation once
  -- but is listed multiple times if it has multiple distinct affiliations
    DISTINCT merged_id,
    grid_id
  FROM (
  -- Selecting all the merged ids and grid ids from the links table
    SELECT
      merged_id,
      grid_id
    FROM
      `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`
      -- if they're AI papers
    WHERE
      merged_id IN (
      SELECT
        cset_id as merged_id
      FROM
        gcp-cset-projects.article_classification.predictions
      WHERE
        ai = TRUE))
  GROUP BY
    Grid_ID,
    merged_id) ai_arts
LEFT JOIN (
-- Adding in org names and country data using GRID
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid) gr
ON
  ai_arts.Grid_ID = gr.id