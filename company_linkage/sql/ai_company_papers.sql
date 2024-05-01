WITH unnested_rors AS (
  SELECT
    CSET_id,
    r as ror_id
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN UNNEST(ror_id) as r
)

-- TODO: this query returns 86,219 results, as opposed to the 130,154 we have from the previous method. One difference
-- is that we are no longer including orgs with ror ids in the regex matching. I need Rebecca to review and
-- determine whether we should also do regex match on orgs with ror ids.
SELECT DISTINCT
  CSET_id,
  merged_id,
  year,
  cv,
  nlp,
  robotics
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
  robotics
FROM
  staging_ai_companies_visualization.org_name_matches
INNER JOIN
  staging_ai_companies_visualization.ai_publications
USING (org_name)
