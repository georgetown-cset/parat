WITH
  names AS (
  SELECT
    field_id AS child_field_id,
    name
  FROM
    fields_of_study.field_meta),
  ai_subfields AS (
  SELECT
    field_id,
    child_field_id,
    name AS child_name
  FROM
    fields_of_study.field_children
  LEFT JOIN
    names
  USING
    (child_field_id)
  WHERE
    -- The AI field_id
    field_id = 154945302
    -- The NLP field id
    OR field_id = 204321447
    -- The data mining field id
    OR field_id = 124101348
    -- The machine learning field id
    OR field_id = 119857082
    -- The information retrieval field id
    OR field_id = 23123220
    -- The pattern recognition field id
    OR field_id = 178980831
    -- The speech recognition field id
    OR field_id = 28490314
    -- The computer vision field id
    OR field_id = 31972630
    -- The data science field id
    OR field_id = 2522767166),
  articles_with_ai_subfields AS (
  SELECT
    DISTINCT merged_id,
    field.id AS field_id,
    field.name AS field_name
  FROM
    fields_of_study.top_fields
  CROSS JOIN
    UNNEST(fields) AS field
  INNER JOIN
    ai_subfields
  ON
    (field.id = child_field_id)
  WHERE
    level = 2),
  company_articles_with_fields AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    field_id,
    field_name
  FROM
    staging_ai_companies_visualization.ai_company_papers
  LEFT JOIN
    articles_with_ai_subfields
  USING
    (merged_id)
  WHERE
    field_name IS NOT NULL),
  mag_counts AS (
  SELECT
    CSET_id,
    field_name,
    COUNT(DISTINCT merged_id) AS field_count
  FROM
    company_articles_with_fields
  GROUP BY
    CSET_id,
    field_name),
  aggregated_fields AS (
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(field_name,
        field_count)
    ORDER BY
      field_count DESC) AS fields
  FROM
    mag_counts
  GROUP BY
    CSET_id)
SELECT
  initial_paper_visualization_data.*,
  fields
FROM
  staging_ai_companies_visualization.initial_paper_visualization_data
LEFT JOIN
  aggregated_fields
USING
  (CSET_id)
ORDER BY
  CSET_id