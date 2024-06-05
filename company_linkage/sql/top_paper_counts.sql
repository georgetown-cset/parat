WITH year_counts AS (
  SELECT
    CSET_id,
    COUNT(DISTINCT(merged_id)) as num_papers,
    year
  FROM
    staging_ai_companies_visualization.pubs_in_top_conferences
  GROUP BY CSET_id, year
)

SELECT
  CSET_id,
  SUM(num_papers) as ai_pubs_in_top_conferences,
  ARRAY_AGG(STRUCT(year, num_papers)) AS ai_pubs_in_top_conferences_by_year
FROM
  year_counts
GROUP BY
  CSET_id