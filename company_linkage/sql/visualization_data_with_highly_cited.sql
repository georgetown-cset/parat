  -- Update the visualization table itself to add highly cited paper data
  -- Pull in the highly cited paper counts, along with the CSET ids to link them in
WITH
  count_data AS (
  SELECT
    CSET_id,
    highly_cited_ai_pubs,
    highly_cited_ai_pubs_by_year,
  FROM
    staging_ai_companies_visualization.highly_cited_paper_counts),
  -- Pull in the current visualization data.
  viz_data AS (
  SELECT
    *
  FROM
    staging_ai_companies_visualization.visualization_data_with_top_papers)
  -- Join the two together using the CSET id
SELECT
  viz_data.*,
  highly_cited_ai_pubs,
  highly_cited_ai_pubs_by_year,
FROM
  viz_data
LEFT JOIN
  count_data
ON
  viz_data.CSET_id = count_data.CSET_id