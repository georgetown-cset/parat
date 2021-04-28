  -- Pulling every AI-associated publication id that is not linked to GRID
  -- We're going to combine every single organization it is linked to into one name so that
  -- We only get one row per publication id and we can just do a regex query on the organization name
  -- We want this because when we count non-GRID AI publications later on, our count will be "for each organization with
  -- our regex matched in its name, how many publication ids are there associated to it?" This means publications will get
  -- counted for multiple organizations if they have affiliates from all of those organizations, but they'll only get
  -- counted once for each organization who they have an author from. So a publication had two authors from Google and one
  -- from IBM, it would increase Google's count by 1 and IBM's count by 1.
CREATE OR REPLACE TABLE
  ai_companies_visualization.no_grid_ai_publications AS
WITH
  ai_papers AS (
  SELECT
    cset_id AS merged_id
  FROM
    gcp-cset-projects.article_classification.predictions
  WHERE
    ai = TRUE),
  grid_link AS (
  SELECT
    -- Pulling data from the combined paper set
    merged_id,
    org_name,
    grid_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`
  WHERE
    -- Only want AI papers
    merged_id IN (
    SELECT
      merged_id
    FROM
      ai_papers) ),
  ai_arts AS (
  SELECT
    DISTINCT merged_id,
    -- Using ^ as a delimeter because it doesn't exist in any of the original names so it should be a clean separator
    -- We want to aggregate because we want every org not associated with a GRID but if there are orgs associated
    -- with GRIDs we don't want to include them. We'll unique on papers in the Python, and we don't have to worry
    -- about overlapping paper counts because for any given company we're either querying with GRID or regex, not both.
    STRING_AGG(org_name, "^") AS org_names,
    grid_id
  FROM
    grid_link
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
  ai_arts.* EXCEPT(grid_id),
  year
FROM
  ai_arts
LEFT JOIN
  article_years
ON
  ai_arts.merged_id = article_years.merged_id
  -- Only want affiliations without GRID
WHERE
  (GRID_ID IS NULL
    OR Grid_ID = "")