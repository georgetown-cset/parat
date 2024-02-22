SELECT
  LOGICAL_AND(all_pubs >= ai_pubs)
  AND LOGICAL_AND(all_pubs >= ai_pubs_in_top_conferences)
FROM
  staging_ai_companies_visualization.visualization_data_with_all_papers