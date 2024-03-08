WITH
  get_citations AS (
  SELECT
    DISTINCT CSET_id,
    references.merged_id,
    cv,
    nlp,
    robotics,
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
    cv,
    nlp,
    robotics,
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
    COUNT(DISTINCT merged_id) AS ai_citation_count,
    COUNT(DISTINCT IF(cv, merged_id, null)) AS cv_citation_count,
    COUNT(DISTINCT IF(nlp, merged_id, null)) AS nlp_citation_count,
    COUNT(DISTINCT IF(robotics, merged_id, null)) AS robotics_citation_count
  FROM
    add_year
  GROUP BY
    CSET_id,
    year),
all_cited as
(SELECT
  CSET_id,
  ARRAY_AGG(STRUCT(year,
      ai_citation_count)
  ORDER BY
    year) AS ai_citation_count_by_year,
  ARRAY_AGG(STRUCT(year,
      cv_citation_count)
  ORDER BY
    year) AS cv_citation_count_by_year,
  ARRAY_AGG(STRUCT(year,
      nlp_citation_count)
  ORDER BY
    year) AS nlp_citation_count_by_year,
  ARRAY_AGG(STRUCT(year,
      robotics_citation_count)
  ORDER BY
    year) AS robotics_citation_count_by_year
FROM
  by_year
GROUP BY
  CSET_id)
SELECT
  CSET_id,
  ai_citation_count_by_year,
  cv_citation_count_by_year,
  nlp_citation_count_by_year,
  robotics_citation_count_by_year
FROM
  high_resolution_entities.aggregated_organizations
LEFT JOIN
  all_cited
USING
  (CSET_id)
ORDER BY
  CSET_id