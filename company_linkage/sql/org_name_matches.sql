-- WARNING: As of 2024-04-09, staging_ai_companies_visualization.org_name_cross_regex is > 35 B rows/5 TB
SELECT
  CSET_id,
  org_name
FROM
  staging_ai_companies_visualization.org_name_cross_regex
WHERE
  REGEXP_CONTAINS(org_name, ARRAY_TO_STRING(regex, "|"))