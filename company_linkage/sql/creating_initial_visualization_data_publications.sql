-- This query pulls the initial visualization data for the table that doesn't have to be compiled (as it's already
-- available in the organizations table) and adds in the AI publication counts.


CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given GRIDs as affiliates
  SELECT
    CSET_id,
    merged_id,
    cv,
    nlp,
    robotics
  FROM
    ai_companies_visualization.ai_company_pubs),
  gridtable AS (
    -- Getting the count of publications
  SELECT
    CSET_id,
    COUNT(DISTINCT merged_id) AS ai_pubs,
    COUNT(DISTINCT CASE WHEN cv IS TRUE THEN merged_id END) as cv_pubs,
    COUNT(DISTINCT CASE WHEN nlp IS TRUE THEN merged_id END) as nlp_pubs,
    COUNT(DISTINCT CASE WHEN robotics IS TRUE THEN merged_id END) as robotics_pubs

  FROM aipubs
  GROUP BY
    CSET_id)
  -- Pulling all the columns we care about that are already in the aggregated organizations table, plus ai_pubs
SELECT
  CSET_id,
  name,
  location.country AS country,
  aliases,
  parent,
  children,
  non_agg_children,
  permid,
  website,
  market,
  crunchbase,
  child_crunchbase,
  grid,
  linkedin,
  in_sandp_500,
  in_fortune_global_500,
  COALESCE(ai_pubs, 0) as ai_pubs,
  COALESCE(cv_pubs, 0) as cv_pubs,
  COALESCE(nlp_pubs, 0) as nlp_pubs,
  COALESCE(robotics_pubs, 0) as robotics_pubs
FROM
  `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS orgs
LEFT JOIN
  gridtable
USING
  (CSET_id)