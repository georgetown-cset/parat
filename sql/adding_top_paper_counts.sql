-- Update the visualization table itself to add top paper data
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
  -- Pull in the top paper counts, along with the CSET ids to link them in
WITH
  count_data AS (
  SELECT
    CSET_id,
    ai_pubs_in_top_conferences
  FROM
    `gcp-cset-projects.ai_companies_visualization.top_paper_counts`),
    -- Pull in the current visualization data. Exclude the ai_pubs_in_top_conferences data, since that was included when we built the top paper data, so we don't need it
  viz_data AS (
  SELECT
    * EXCEPT(ai_pubs_in_top_conferences)
  FROM
    `gcp-cset-projects.ai_companies_visualization.visualization_data`)
    -- Join the two together using the CSET id
SELECT
  viz_data.*, ai_pubs_in_top_conferences
FROM
  viz_data
LEFT JOIN
  count_data
ON
  viz_data.CSET_id = count_data.CSET_id