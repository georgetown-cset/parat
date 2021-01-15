CREATE OR REPLACE TABLE
  ai_companies_visualization.no_grid_ai_publications AS
SELECT
  ai_arts.* EXCEPT(grid_id)
FROM (
  SELECT
    DISTINCT merged_id,
    -- Using ^ as a delimeter because it doesn't exist in any of the original names so it should be a clean separator
    -- We want to aggregate because we want every org not associated with a GRID but if there are orgs associated
    -- with GRIDs we don't want to include them. We'll unique on papers in the Python, and we don't have to worry
    -- about overlapping paper counts because for any given company we're either querying with GRID or regex, not both.
    STRING_AGG(org_name, "^") AS org_names,
    grid_id
  FROM (
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
        cset_id AS merged_id
      FROM
        gcp-cset-projects.article_classification.predictions
      WHERE
        ai = TRUE))
  GROUP BY
    Grid_ID,
    merged_id) ai_arts
  -- Only want affiliations without GRID
WHERE
  (GRID_ID IS NULL
    OR Grid_ID = "")