WITH year_counts AS (
  SELECT
    CSET_id,
    COUNT(DISTINCT(merged_id)) as year_count,
    year
  FROM
    staging_ai_companies_visualization.highly_cited_ai_publications
  GROUP BY CSET_id, year
)

SELECT
  CSET_id,
  SUM(year_count) as all_pubs,
  ARRAY_AGG(STRUCT(year, year_count)) AS all_pubs_by_year
FROM
  year_counts
GROUP BY
  CSET_id