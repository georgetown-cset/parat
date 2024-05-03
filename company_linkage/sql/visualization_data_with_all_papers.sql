  -- Update the visualization table itself to add total paper data
  -- Pull in the total paper counts, along with the CSET ids to link them in
WITH
  count_data AS (
  SELECT
    CSET_id,
    all_pubs,
    all_pubs_by_year,
  FROM
    staging_ai_companies_visualization.all_paper_counts),
  -- Pull in the current visualization data
  viz_data AS (
  SELECT
    *
  FROM
    staging_ai_companies_visualization.visualization_data_with_highly_cited)
  -- Join the two together using the CSET id
SELECT
  viz_data.*,
  COALESCE(all_pubs, 0) as all_pubs,
  all_pubs_by_year,
FROM
  viz_data
LEFT JOIN
  count_data
ON
  viz_data.CSET_id = count_data.CSET_id