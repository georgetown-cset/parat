CREATE OR REPLACE TABLE
  ai_companies_visualization.paper_visualization_data AS
WITH
  company_cluster_assignment AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    cluster_id
  FROM
    ai_companies_visualization.ai_company_pubs
  LEFT JOIN
    `gcp-cset-projects.science_map_v2.dc5_cluster_assignment_stable`
  USING
    (merged_id)
  WHERE
    cluster_id IS NOT NULL),
  map_counts AS (
  SELECT
    CSET_id,
    cluster_id,
    COUNT(DISTINCT merged_id) AS cluster_count
  FROM
    company_cluster_assignment
  GROUP BY
    CSET_id,
    cluster_id),
  aggregated_clusters AS (
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(cluster_id,
        cluster_count)
    ORDER BY
      cluster_count DESC) AS clusters
  FROM
    map_counts
  GROUP BY
    CSET_id)
SELECT
  paper_visualization_data.*,
  clusters
FROM
  ai_companies_visualization.paper_visualization_data
LEFT JOIN
  aggregated_clusters
USING
  (CSET_id)
ORDER BY
  CSET_id