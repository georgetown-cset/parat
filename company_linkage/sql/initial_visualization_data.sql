-- This query pulls the initial visualization data for the table that doesn't have to be compiled (as it's already
-- available in the organizations table) and adds in the AI publication counts.
WITH
  aipubs AS (
    -- Pulling all the papers with any of the given RORs as affiliates
  SELECT
    CSET_id,
    merged_id,
    cv,
    nlp,
    robotics,
    ai_safety,
    llm
  FROM
    staging_ai_companies_visualization.ai_company_papers),
  rortable AS (
    -- Getting the count of publications
  SELECT
    CSET_id,
    COUNT(DISTINCT merged_id) AS ai_pubs,
    COUNT(DISTINCT CASE WHEN cv IS TRUE THEN merged_id END) as cv_pubs,
    COUNT(DISTINCT CASE WHEN nlp IS TRUE THEN merged_id END) as nlp_pubs,
    COUNT(DISTINCT CASE WHEN robotics IS TRUE THEN merged_id END) as robotics_pubs,
    COUNT(DISTINCT CASE WHEN ai_safety IS TRUE THEN merged_id END) as ai_safety_pubs,
    COUNT(DISTINCT CASE WHEN llm IS TRUE THEN merged_id END) as llm_pubs
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
  description,
  description_source,
  description_link,
  description_retrieval_date,
  child_permid,
  website,
  market,
  crunchbase,
  child_crunchbase,
  ror_id,
  linkedin,
  in_sandp_500,
  in_fortune_global_500,
  in_global_big_tech,
  in_gen_ai,
  COALESCE(ai_pubs, 0) as ai_pubs,
  COALESCE(cv_pubs, 0) as cv_pubs,
  COALESCE(nlp_pubs, 0) as nlp_pubs,
  COALESCE(robotics_pubs, 0) as robotics_pubs,
  COALESCE(ai_safety_pubs, 0) as ai_safety_pubs,
  COALESCE(llm_pubs, 0) as llm_pubs
FROM
  high_resolution_entities.aggregated_organizations
LEFT JOIN
  rortable
USING
  (CSET_id)