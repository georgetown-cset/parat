-- Check that the paper visualization data table has all the CSET organization ids in the table before
-- we run omit by rule
SELECT
  COUNT(DISTINCT paper_visualization_data_with_methods.CSET_id) = COUNT(DISTINCT aggregated_organizations.CSET_id)
  AND LOGICAL_AND(paper_visualization_data_with_methods.CSET_id IS NOT NULL)
FROM
  staging_ai_companies_visualization.paper_visualization_data_with_methods
FULL OUTER JOIN
  high_resolution_entities.aggregated_organizations
USING
  (CSET_id)