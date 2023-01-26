CREATE OR REPLACE TABLE
  ai_companies_visualization.paper_visualization_data AS
WITH
  articles_with_ai_methods AS (
  SELECT
    DISTINCT merged_id,
    referent,
  FROM
    `gcp-cset-projects.tasks_and_methods.method_referents`
  CROSS JOIN
    UNNEST(referents) AS referent),
  company_articles_with_methods AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    referent
  FROM
    ai_companies_visualization.ai_company_pubs
  LEFT JOIN
    articles_with_ai_methods
  USING
    (merged_id)
  WHERE
    referent IS NOT NULL),
  method_counts AS (
  SELECT
    CSET_id,
    referent,
    COUNT(DISTINCT merged_id) AS method_count
  FROM
    company_articles_with_methods
  GROUP BY
    CSET_id,
    referent),
  aggregated_fields AS (
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(referent,
        method_count)
    ORDER BY
      method_count DESC) AS methods
  FROM
    method_counts
  GROUP BY
    CSET_id)
SELECT
  paper_visualization_data.*,
  methods
FROM
  ai_companies_visualization.paper_visualization_data
LEFT JOIN
  aggregated_fields
USING
  (CSET_id)
ORDER BY
  CSET_id