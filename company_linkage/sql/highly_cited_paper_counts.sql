WITH year_counts AS (
  SELECT
    CSET_id,
    COUNT(DISTINCT(merged_id)) as num_papers,
    year
  FROM
    staging_ai_companies_visualization.highly_cited_ai_publications
  GROUP BY CSET_id, year
)

SELECT
  CSET_id,
  SUM(num_papers) as highly_cited_ai_pubs,
  ARRAY_AGG(STRUCT(year, num_papers)) AS highly_cited_ai_pubs_by_year
FROM
  year_counts
GROUP BY
  CSET_id