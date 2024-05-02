WITH
ai_pubs AS (
  SELECT
    merged_id,
    ror_id,
    org_name,
    country,
    year
  FROM
    staging_ai_companies_visualization.ai_publications
),

citation_counts AS (
  SELECT
    DISTINCT ref_id AS merged_id,
    COUNT(DISTINCT
    REFERENCES
      .merged_id) AS citation_count,
    ror_id,
    org_name,
    country,
    year
  FROM
    literature.references
  INNER JOIN
    ai_pubs
  ON
    ref_id = ai_pubs.merged_id
  GROUP BY
    ref_id,
    ror_id,
    org_name,
    country,
    year
),

get_top_cited AS (
  SELECT
    DISTINCT merged_id,
    citation_count,
    ror_id,
    org_name,
    country,
  IF
    (citation_count >= PERCENTILE_CONT(citation_count, 0.9) OVER(PARTITION BY year), TRUE, FALSE) AS top_cited,
    year
  FROM
    citation_counts
),

unnested_rors AS (
  SELECT
    CSET_id,
    r as ror_id
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN UNNEST(ror_id) as r
),

top_cited AS (
  SELECT
    DISTINCT merged_id,
    ror_id,
    org_name,
    country,
    year
  FROM
    get_top_cited
  WHERE
    top_cited IS true
)

SELECT DISTINCT
  CSET_id,
  merged_id,
  year
FROM
  unnested_rors
INNER JOIN
  top_cited
USING (ror_id)
UNION DISTINCT
SELECT
  CSET_id,
  merged_id,
  year
FROM
  staging_ai_companies_visualization.org_name_matches
INNER JOIN
  top_cited
USING (org_name)
