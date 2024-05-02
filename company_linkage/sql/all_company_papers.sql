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
  year
FROM
  unnested_rors
INNER JOIN
  staging_ai_companies_visualization.all_publications
USING (ror_id)
UNION DISTINCT
SELECT
  CSET_id,
  merged_id,
  year
FROM
  staging_ai_companies_visualization.org_name_matches
INNER JOIN
  staging_ai_companies_visualization.all_publications
USING (org_name)