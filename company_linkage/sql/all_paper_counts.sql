WITH year_counts AS (
  SELECT
    CSET_id,
    COUNT(DISTINCT(merged_id)) as num_papers,
    year
  FROM
    staging_ai_companies_visualization.all_company_papers
  GROUP BY CSET_id, year
)

SELECT
  CSET_id,
  SUM(num_papers) as all_pubs,
  ARRAY_AGG(STRUCT(year, num_papers)) AS all_pubs_by_year
FROM
  year_counts
GROUP BY
  CSET_id