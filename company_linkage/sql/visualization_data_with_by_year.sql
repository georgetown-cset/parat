-- Adding AI publication data by year to the visualization table
-- This uses the same mechanism as adding AI publication counts; we're just doing it on a by-year basis
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    CSET_id,
    merged_id,
    year,
    cv,
    nlp,
    robotics
  FROM
    staging_ai_companies_visualization.ai_company_papers),
  rortable AS (
    -- Getting the count of publications
  SELECT
    CSET_id,
    year,
    COUNT(DISTINCT merged_id) AS ai_pubs,
    COUNT(DISTINCT CASE WHEN cv IS TRUE THEN merged_id END) as cv_pubs,
    COUNT(DISTINCT CASE WHEN nlp IS TRUE THEN merged_id END) as nlp_pubs,
    COUNT(DISTINCT CASE WHEN robotics IS TRUE THEN merged_id END) as robotics_pubs
  FROM  aipubs
   WHERE year IS NOT NULL
  GROUP BY
    CSET_id,
    year),
  -- Aggregating the by-year data so it's all in one field
  by_year AS (
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(year,
        ai_pubs)
    ORDER BY
      year) AS ai_pubs_by_year,
   ARRAY_AGG(STRUCT(year,
        cv_pubs)
    ORDER BY
      year) AS cv_pubs_by_year,
   ARRAY_AGG(STRUCT(year,
        nlp_pubs)
    ORDER BY
      year) AS nlp_pubs_by_year,
   ARRAY_AGG(STRUCT(year,
        robotics_pubs)
    ORDER BY
      year) AS robotics_pubs_by_year,
  FROM
    high_resolution_entities.aggregated_organizations
  LEFT JOIN
    rortable
  USING
    (CSET_id)
  GROUP BY
    CSET_id)
SELECT
  initial_visualization_data.*,
  ai_pubs_by_year,
  cv_pubs_by_year,
  nlp_pubs_by_year,
  robotics_pubs_by_year
FROM
  staging_ai_companies_visualization.initial_visualization_data
LEFT JOIN
  by_year
ON
  initial_visualization_data.CSET_id = by_year.CSET_id
ORDER BY cset_id