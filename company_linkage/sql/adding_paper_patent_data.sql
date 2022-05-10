-- DEPRECATED, REMOVE SOON
-- Update the visualization table itself to add paper and patent data
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
  -- Pull in the paper and patent counts, along with the CSET ids to link them in
WITH
  count_data AS (
  SELECT
    CSET_id,
    ai_pubs,
    ai_pubs_by_year,
    ai_patents,
    ai_patents_by_year
  FROM
    `gcp-cset-projects.ai_companies_visualization.paper_patent_counts`),
    -- Pull in the current visualization data. Exclude the ai_pubs data, since that was included when we built the paper/patent data, so we don't need it
  viz_data AS (
  SELECT
    * EXCEPT(ai_pubs, ai_pubs_by_year)
  FROM
    `gcp-cset-projects.ai_companies_visualization.visualization_data`)
    -- Join the two together using the CSET id
SELECT
  viz_data.*,
  ai_pubs,
  ai_pubs_by_year,
  ai_patents,
  ai_patents_by_year
FROM
  viz_data
LEFT JOIN
  count_data
ON
  viz_data.CSET_id = count_data.CSET_id