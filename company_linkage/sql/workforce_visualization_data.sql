CREATE OR REPLACE TABLE
  `gcp-cset-projects.ai_companies_visualization.workforce_visualization_data` AS
  -- Selecting the companies we want to leave out
WITH
  to_omit AS (
  SELECT
    CSET_id
  FROM
    ai_companies_visualization.visualization_data
  RIGHT JOIN
    ai_companies_visualization.workforce_visualization_data
  USING (cset_id)
  WHERE visualization_data.cset_id IS NULL)
SELECT
  *
FROM
  `gcp-cset-projects.ai_companies_visualization.workforce_visualization_data`
WHERE
  CSET_id NOT IN (
  SELECT
    *
  FROM
    to_omit)