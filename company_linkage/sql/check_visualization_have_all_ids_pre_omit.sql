-- Check that the visualization data table has all the CSET organization ids in the table before
-- we run omit by rule
SELECT
  COUNT(DISTINCT visualization_data_with_all_papers.CSET_id) = COUNT(DISTINCT aggregated_organizations.CSET_id)
  AND LOGICAL_AND(visualization_data_with_all_papers.CSET_id IS NOT NULL)
FROM
  staging_ai_companies_visualization.visualization_data_with_all_papers
FULL OUTER JOIN
  high_resolution_entities.aggregated_organizations
USING
  (CSET_id)