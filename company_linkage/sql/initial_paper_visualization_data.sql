WITH
  get_citations AS (
  SELECT
    DISTINCT CSET_id,
    references.merged_id,
    ref_id
  FROM
    staging_ai_companies_visualization.ai_company_papers
  LEFT JOIN
    literature.references
  ON
    (ai_company_papers.merged_id = ref_id)),
  add_year AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    ref_id,
    year
  FROM
    get_citations
  LEFT JOIN
    literature.papers
  USING
    (merged_id)
  WHERE
    year IS NOT NULL),
  by_year AS (
  SELECT
    CSET_id,
    year,
    COUNT(DISTINCT merged_id) AS citation_count
  FROM
    add_year
  GROUP BY
    CSET_id,
    year)
SELECT
  CSET_id,
  ARRAY_AGG(STRUCT(year,
      citation_count)
  ORDER BY
    year) AS citation_count_by_year
FROM
  by_year
GROUP BY
  CSET_id
ORDER BY
  CSET_id