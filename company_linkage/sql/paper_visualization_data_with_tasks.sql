WITH
  articles_with_ai_tasks AS (
  SELECT
    DISTINCT merged_id,
    referent,
  FROM
    tasks_and_methods.task_referents
  CROSS JOIN
    UNNEST(referents) AS referent),
  company_articles_with_tasks AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    referent
  FROM
    staging_ai_companies_visualization.ai_company_papers
  LEFT JOIN
    articles_with_ai_tasks
  USING
    (merged_id)
  WHERE
    referent IS NOT NULL),
  task_counts AS (
  SELECT
    CSET_id,
    referent,
    COUNT(DISTINCT merged_id) AS task_count
  FROM
    company_articles_with_tasks
  GROUP BY
    CSET_id,
    referent),
  aggregated_fields AS (
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(referent,
        task_count)
    ORDER BY
      task_count DESC) AS tasks
  FROM
    task_counts
  GROUP BY
    CSET_id)
SELECT
  paper_visualization_data_with_company_references.*,
  tasks
FROM
  staging_ai_companies_visualization.paper_visualization_data_with_company_references
LEFT JOIN
  aggregated_fields
USING
  (CSET_id)
ORDER BY
  CSET_id