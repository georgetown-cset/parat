  -- Update the visualization table itself to add total paper data
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
  -- Pull in the total paper counts, along with the CSET ids to link them in
WITH
  count_data AS (
  SELECT
    CSET_id,
    all_pubs,
    all_pubs_by_year,
  FROM
    `gcp-cset-projects.ai_companies_visualization.total_paper_counts`),
  -- Pull in the current visualization data. Exclude the all_paper data, since that was included when we built the all paper data, so we don't need it
  viz_data AS (
  SELECT
    * EXCEPT(all_pubs,
      all_pubs_by_year)
  FROM
    `gcp-cset-projects.ai_companies_visualization.visualization_data`)
  -- Join the two together using the CSET id
SELECT
  viz_data.*,
  all_pubs,
  all_pubs_by_year,
FROM
  viz_data
LEFT JOIN
  count_data
ON
  viz_data.CSET_id = count_data.CSET_id