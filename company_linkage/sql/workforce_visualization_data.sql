  -- Selecting the companies we want to leave out
  -- Essentially, visualization_data_omit_by_rule contains all the companies that we want
  -- to retain after the omit_by_rule process has been applied
  -- So, here, in to_omit, we select any company that isn't found in that table as a
  -- company we'd like to omit, replicating the rule-based omission.
  -- This allows us to omit the same set of companies across all of our tables.
WITH
  to_omit AS (
  SELECT
    CSET_id
  FROM
    staging_ai_companies_visualization.visualization_data_omit_by_rule
  RIGHT JOIN
    staging_ai_companies_visualization.workforce_visualization_data_with_ai_jobs
  USING (cset_id)
  WHERE visualization_data_omit_by_rule.cset_id IS NULL)
SELECT
  *
FROM
  staging_ai_companies_visualization.workforce_visualization_data_with_ai_jobs
WHERE
  CSET_id NOT IN (
  SELECT
    *
  FROM
    to_omit)