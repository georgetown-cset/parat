SELECT
  COUNT(*) = 0
FROM
  staging_ai_companies_visualization.visualization_data_with_all_papers
WHERE
  ai_pubs IS NULL
  OR robotics_pubs IS NULL
  OR cv_pubs IS NULL
  OR nlp_pubs IS NULL
  OR ai_pubs_in_top_conferences IS NULL
  OR all_pubs IS NULL