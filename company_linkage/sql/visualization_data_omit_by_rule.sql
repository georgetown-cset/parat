CREATE OR REPLACE TABLE
  `gcp-cset-projects.ai_companies_visualization.visualization_data` AS
  -- Selecting the companies we want to leave out
WITH
  to_omit AS (
  SELECT
    CSET_id
  FROM
    ai_companies_visualization.visualization_data
  LEFT JOIN
    ai_companies_visualization.patent_visualization_data
  USING (cset_id)
  LEFT JOIN
    ai_companies_visualization.workforce_visualization_data
  USING
    (cset_id)
  WHERE
  -- Our exclusion rules
  -- If a company has no output at all, and has no crunchbase info,
  -- and is privately held so we can't get public info on it, it's not of much interest for this
    (ai_pubs = 0 or ai_pubs IS NULL)
    AND (ai_patents = 0 or ai_patents IS NULL)
    AND (ai_pubs_in_top_conferences = 0 or ai_pubs_in_top_conferences IS NULL)
    AND (crunchbase.crunchbase_uuid IS NULL
      OR crunchbase.crunchbase_uuid = "")
    AND (crunchbase.crunchbase_url IS NULL
      OR crunchbase.crunchbase_url = "")
    AND (tt1_jobs = 0 or tt1_jobs IS NULL)
    AND ARRAY_LENGTH(market) = 0
    and in_fortune_global_500 IS FALSE
    and in_sandp_500 IS FALSE)
SELECT
  *
FROM
  `gcp-cset-projects.ai_companies_visualization.visualization_data`
WHERE
  CSET_id NOT IN (
  SELECT
    *
  FROM
    to_omit)