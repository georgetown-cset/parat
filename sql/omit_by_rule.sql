-- Omitting a swath of companies, by rule, that we believe are unlikely to hold much interest
-- We're essentially leaving out companies that we have very little data for
-- If there's no papers or patents or private financial info (Crunchbase) or public financial info (possible if it's on the market)
-- Then what can we even share?
CREATE OR REPLACE TABLE
  `gcp-cset-projects.ai_companies_visualization.visualization_data` AS
  -- Selecting the companies we want to leave out
WITH
  to_omit AS (
  SELECT
    CSET_id
  FROM
    `gcp-cset-projects.ai_companies_visualization.visualization_data`
    -- We're left joining instead of cross joining because we WANT to include nulls
  LEFT JOIN
    UNNEST(crunchbase) AS crunch
  LEFT JOIN
    UNNEST(market) AS mark
  WHERE
  -- Our exclusion rules
  -- If a company has no output at all, and has no crunchbase info,
  -- and is privately held so we can't get public info on it, it's not of much interest for this
    ai_pubs = 0
    AND ai_patents = 0
    AND ai_pubs_in_top_conferences = 0
    AND (crunch.crunchbase_uuid IS NULL
      OR crunch.crunchbase_uuid = "")
    AND (crunch.crunchbase_url IS NULL
      OR crunch.crunchbase_url = "") )
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