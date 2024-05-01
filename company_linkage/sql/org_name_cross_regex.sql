-- WARNING: this query generates a table of > 69 B rows/11.9 TB of results as of 2024-05-01
WITH no_ror_orgs AS (
  SELECT
    org_name
  FROM
    staging_ai_companies_visualization.all_publications
  WHERE
    ror_id IS NULL
  UNION DISTINCT
  SELECT
    assignee as org_name
  FROM
    staging_ai_companies_visualization.linked_ai_patents
  WHERE
    ror_id IS NULL
  UNION DISTINCT
  SELECT
    assignee as org_name
  FROM
    staging_ai_companies_visualization.linked_ai_patents_grants
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

