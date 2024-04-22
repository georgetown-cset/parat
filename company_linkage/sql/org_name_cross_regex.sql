-- WARNING: this query generates a table of > 35 B rows/5 TB of results
WITH no_ror_orgs AS (
  SELECT DISTINCT
    org_name
  FROM
    literature.affiliations
  WHERE
    ror_id IS NULL
)

SELECT
  CSET_id,
  regex,
  org_name
FROM high_resolution_entities.aggregated_organizations
CROSS JOIN
no_ror_orgs
