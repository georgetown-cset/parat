-- Check that the workforce visualization data table has all the CSET organization ids in the table before
-- we run omit by rule
SELECT
  COUNT(DISTINCT workforce_visualization_data_with_ai_jobs.CSET_id) = COUNT(DISTINCT aggregated_organizations.CSET_id)
  AND LOGICAL_AND(workforce_visualization_data_with_ai_jobs.CSET_id IS NOT NULL)
FROM
  staging_ai_companies_visualization.workforce_visualization_data_with_ai_jobs
FULL OUTER JOIN
  high_resolution_entities.aggregated_organizations
USING
  (CSET_id)