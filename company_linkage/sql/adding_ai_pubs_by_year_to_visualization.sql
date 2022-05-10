-- Adding AI publication data by year to the visualization table
-- This uses the same mechanism as adding AI publication counts; we're just doing it on a by-year basis
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    id,
    merged_id,
    year,
    cv,
    nlp,
    robotics
  FROM
    ai_companies_visualization.ai_company_pubs),
  gridtable AS (
    -- Getting the count of publications
  SELECT
    id,
    year,
    COUNT(DISTINCT merged_id) AS ai_pubs,
    COUNT(DISTINCT CASE WHEN cv IS TRUE THEN merged_id END) as cv_pubs,
    COUNT(DISTINCT CASE WHEN nlp IS TRUE THEN merged_id END) as nlp_pubs,
    COUNT(DISTINCT CASE WHEN robotics IS TRUE THEN merged_id END) as robotics_pubs
  FROM  aipubs
   WHERE year IS NOT NULL
  GROUP BY
    id,
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
    `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS orgs
  LEFT JOIN
    gridtable
  ON
    orgs.CSET_id = gridtable.id
  GROUP BY
    CSET_id)
SELECT
  viz.*,
  ai_pubs_by_year,
  cv_pubs_by_year,
  nlp_pubs_by_year,
  robotics_pubs_by_year
FROM
  `gcp-cset-projects.ai_companies_visualization.visualization_data` AS viz
LEFT JOIN
  by_year
ON
  viz.CSET_id = by_year.CSET_id
ORDER BY cset_id