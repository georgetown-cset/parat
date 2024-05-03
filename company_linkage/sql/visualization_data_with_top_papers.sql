  -- Update the visualization table itself to add top paper data
  -- Pull in the top paper counts, along with the CSET ids to link them in
WITH
  count_data AS (
  SELECT
    CSET_id,
    ai_pubs_in_top_conferences,
    ai_pubs_in_top_conferences_by_year,
  FROM
    staging_ai_companies_visualization.top_paper_counts),
  -- Pull in the current visualization data.
  viz_data AS (
  SELECT
    *
  FROM
    staging_ai_companies_visualization.visualization_data_with_by_year)
  -- Join the two together using the CSET id
SELECT
  viz_data.*,
  COALESCE(ai_pubs_in_top_conferences, 0) AS ai_pubs_in_top_conferences,
  ai_pubs_in_top_conferences_by_year,
FROM
  viz_data
LEFT JOIN
  count_data
ON
  viz_data.CSET_id = count_data.CSET_id