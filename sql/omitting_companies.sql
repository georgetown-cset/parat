-- We want to omit companies from the visualization
CREATE OR REPLACE TABLE
  ai_companies_visualization.visualization_data AS
SELECT
  *
FROM
  `gcp-cset-projects.ai_companies_visualization.visualization_data`
 -- Omitting companies based on list
WHERE
  CSET_id NOT IN (
  SELECT
    *
  FROM
    ai_companies_visualization.omit)
-- We may also omit in a rule-based way, but we haven't implemented this yet!
-- Waiting to come up with a final definition of a rule