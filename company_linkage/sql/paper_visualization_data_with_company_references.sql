CREATE OR REPLACE TABLE
  ai_companies_visualization.paper_visualization_data AS
-- First get all the articles cited by the AI papers written by our companies
WITH
  get_references AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    ref_id
  FROM
    ai_companies_visualization.ai_company_pubs
  LEFT JOIN
    `gcp-cset-projects.gcp_cset_links_v2.paper_references_merged`
  USING
    (merged_id)),
  referenced_companies AS (
  SELECT
    DISTINCT get_references.CSET_id,
    get_references.merged_id,
    ref_id,
    ai_company_pubs.CSET_id AS ref_CSET_id
  FROM
    get_references
  INNER JOIN
    ai_companies_visualization.ai_company_pubs
  ON
    ref_id = ai_company_pubs.merged_id
  ORDER BY
    CSET_id),
  count_company_refs AS (
  SELECT
    CSET_id,
    ref_CSET_id,
    -- We want the count of distinct references
    -- Not the count of distinct referenced articles: count(distinct ref_id)
    -- Or the count of distinct articles written by the company that reference work by the other company: count(distinct merged_id)
    COUNT(DISTINCT merged_id || ref_id) AS referenced_count
  FROM
    referenced_companies
  GROUP BY
    CSET_id,
    ref_CSET_id),
aggregated_refs as
(SELECT
  CSET_id,
  ARRAY_AGG(STRUCT(ref_CSET_id,
      referenced_count)
  ORDER BY
    referenced_count DESC) AS company_references
FROM
  count_company_refs
GROUP BY
  CSET_id
ORDER BY
  CSET_id)
  SELECT
  paper_visualization_data.*,
  company_references
FROM
  ai_companies_visualization.paper_visualization_data
LEFT JOIN
  aggregated_refs
USING
  (CSET_id)
ORDER BY
  CSET_id