  -- Selecting the companies we want to leave out
WITH
  to_omit AS (
  SELECT
    CSET_id
  FROM
    staging_ai_companies_visualization.visualization_data_omit_by_rule
  RIGHT JOIN
    staging_ai_companies_visualization.patent_visualization_data_with_by_year
  USING (cset_id)
  WHERE visualization_data_omit_by_rule.cset_id IS NULL)
SELECT
  *
FROM
  staging_ai_companies_visualization.patent_visualization_data_with_by_year
WHERE
  CSET_id NOT IN (
  SELECT
    *
  FROM
    to_omit)