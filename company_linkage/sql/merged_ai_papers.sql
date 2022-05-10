CREATE OR REPLACE TABLE
  `gcp-cset-projects.ai_companies_visualization.ai_company_pubs` AS
SELECT
  DISTINCT *
FROM
  `gcp-cset-projects.ai_companies_visualization.ai_company_pubs`
UNION DISTINCT
SELECT
  DISTINCT *
FROM
  `gcp-cset-projects.ai_companies_visualization.ai_company_pubs_no_grid`
ORDER BY
  id