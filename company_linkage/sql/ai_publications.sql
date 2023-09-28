  -- Pulling every AI-associated publication id linked to every grid id and every organization name
  -- We also include years because we'll want those later for yearly counts
  -- and cv/robotics/nlp so we can filter on these
WITH
  ai_papers AS (
  SELECT
    cset_id AS merged_id,
    cv_filtered,
    nlp_filtered,
    robotics_filtered
  FROM
    gcp-cset-projects.article_classification.predictions
  WHERE
    ai_filtered = TRUE OR cv_filtered = TRUE OR nlp_filtered = TRUE OR robotics_filtered = TRUE),
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
    DISTINCT
    merged_id,
    grid_id,
    org_name,
    cv_filtered as cv,
    nlp_filtered as nlp,
    robotics_filtered as robotics
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`
    -- if they're AI papers
  INNER JOIN ai_papers
    USING (merged_id)),
  article_years AS (
  SELECT
    merged_id,
    year
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.corpus_merged`)
SELECT
  -- Adding in the org name and country associated with the grid id
  merged_grids.* EXCEPT (org_name),
  COALESCE(gr.org_name, merged_grids.org_name) as org_name,
  country,
  year
FROM
  merged_grids
LEFT JOIN
  gr
ON
  merged_grids.Grid_ID = gr.id
LEFT JOIN
  article_years
ON
  merged_grids.merged_id = article_years.merged_id