WITH
  company_cluster_assignment AS (
  SELECT
    DISTINCT CSET_id,
    merged_id,
    cluster_id
  FROM
    staging_ai_companies_visualization.ai_company_papers
  LEFT JOIN
    map_of_science.cluster_assignment
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
  paper_visualization_data_with_mag.*,
  clusters
FROM
  staging_ai_companies_visualization.paper_visualization_data_with_mag
LEFT JOIN
  aggregated_clusters
USING
  (CSET_id)
ORDER BY
  CSET_id