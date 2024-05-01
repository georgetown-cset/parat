-- WARNING: As of 2024-05-01, staging_ai_companies_visualization.org_name_cross_regex is > 69 B rows/11.9 TB
SELECT DISTINCT
  CSET_id,
  org_name
FROM
  staging_ai_companies_visualization.org_name_cross_regex
LEFT JOIN
  UNNEST(regex) as r
WHERE
  REGEXP_CONTAINS(org_name, r)