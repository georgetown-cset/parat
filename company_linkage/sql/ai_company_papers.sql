WITH unnested_rors AS (
  SELECT
    CSET_id,
    r as ror_id
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN UNNEST(ror_id) as r
)

SELECT DISTINCT
  CSET_id,
  merged_id,
  year,
  cv,
  nlp,
  robotics,
  ai_safety,
  llm
FROM
  unnested_rors
INNER JOIN
  staging_ai_companies_visualization.ai_publications
USING (ror_id)
UNION DISTINCT
SELECT
  CSET_id,
  merged_id,
  year,
  cv,
  nlp,
  robotics,
  ai_safety,
  llm
FROM
  staging_ai_companies_visualization.org_name_matches
INNER JOIN
  staging_ai_companies_visualization.ai_publications
USING (org_name)
