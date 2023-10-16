-- Check that the patent visualization data table has all the CSET organization ids in the table before
-- we run omit by rule
SELECT
  COUNT(DISTINCT patent_visualization_data_with_by_year.CSET_id) = COUNT(DISTINCT aggregated_organizations.CSET_id)
  AND LOGICAL_AND(patent_visualization_data_with_by_year.CSET_id IS NOT NULL)
FROM
  staging_ai_companies_visualization.patent_visualization_data_with_by_year
FULL OUTER JOIN
  high_resolution_entities.aggregated_organizations
USING
  (CSET_id)