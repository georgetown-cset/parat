# AI Companies Visualization

## What is in the workspace

* SQL (see order to run below)
* Schemas for the three tables that need to be loaded to BigQuery.
* A Python script to aggregate our initial organization list into parent organizations. This can be run on any organization list.  
* Python scripts for getting AI paper/patent counts and top conference paper counts
* A Python script used to do a one time clean up/deduplication for the initial company data in the visualization
* Unit tests for the Python script to get counts. As the same functions are used in the
script to get top conference papers, these tests will work for both.
* A unit test for the Python script to aggregate our initial organization list.

This code is dependent on internal CSET BigQuery datasets; without access to these datasets, you will not be able to
run some of this code as-is.

## Tasks to build visualization data

1. [selecting_grid_ai_publications.sql](sql/selecting_grid_ai_publications.sql)
2. `python3 aggregate_organizations.py aggregated_organizations.jsonl`
3. Replace `high_resolution_entities.aggregated_organizations` with the data from `aggregated_organizations.jsonl` using the [aggregated_organizations_schema](schemas/aggregated_organizations_schema.json)
4. [selecting_no_grid_ai_publications.sql](sql/selecting_no_grid_ai_publications.sql)
5. [selecting_grid_ai_patents.sql](sql/selecting_grid_ai_patents.sql)
6. [selecting_no_grid_ai_patents.sql](sql/selecting_no_grid_ai_patents.sql)
7. [selecting_grid_ai_pubs_by_cset_id.sql](sql/selecting_grid_ai_pubs_by_cset_id.sql)
8. `python3 get_ai_counts.py ai_counts.jsonl` 
9. Upload `ai_company_papers.jsonl` to `ai_companies_visualization.ai_company_pubs_no_grid` using the [ai_papers_schema](schemas/ai_papers_schema.json)
10. [merge_ai_papers.sql](sql/merged_ai_papers.sql)
11. Upload `ai_company_patents.jsonl` to `ai_companies_visualization.ai_company_patents` using the [ai_patents_schema](schemas/ai_patents_schema.json)
12. [creating_initial_visualization_data_publications.sql](sql/creating_initial_visualization_data_publications.sql)
13. [adding_ai_pubs_by_year_to_visualization.sql](sql/adding_ai_pubs_by_year_to_visualization.sql)
14. [creating_patent_visualization_data.sql](sql/creating_patent_visualization_data.sql)
15. [adding_ai_patents_by_year_to_visualization.sql](sql/adding_ai_patents_by_year_to_visualization.sql)
16. [creating_paper_visualization_data.sql](sql/creating_paper_visualization_data.sql)
17. [adding_top_mag_ai_fields.sql](sql/adding_top_mag_ai_fields.sql)
18. [adding_top_science_map_clusters.sql](sql/adding_top_science_map_clusters.sql)
19. [adding_company_references.sql](sql/adding_company_references.sql)
20. [adding_top_tasks.sql](sql/adding_top_tasks.sql)
21. [adding_top_methods.sql](sql/adding_top_methods.sql)
22. [selecting_top_conference_pubs.sql](sql/selecting_top_conference_pubs.sql)
23. [pulling_publication_counts_in_top_ai_publications_grid.sql](sql/pulling_publication_counts_in_top_ai_publications_grid.sql)
24. [pulling_publication_counts_in_top_conferences_no_grid.sql](sql/pulling_publication_counts_in_top_conferences_no_grid.sql)
25. [adding_grid_ai_pubs_in_top_conferences_to_visualization.sql](sql/adding_grid_ai_pubs_in_top_conferences_to_visualization.sql)
26. [adding_grid_ai_pubs_in_top_conferences_by_year_to_visualization.sql](sql/adding_grid_ai_pubs_in_top_conferences_by_year_to_visualization.sql)
27. `python3 top_papers.py top_paper_counts.jsonl`
28. Upload `top_paper_counts.jsonl` to `ai_companies_visualization.top_paper_counts` using the [top_papers_schema](schemas/top_papers_schema.json)
29. [adding_top_paper_counts.sql](sql/adding_top_paper_counts.sql)
30. [selecting_grid_all_publications.sql](sql/selecting_grid_all_publications.sql)
31. [selecting_no_grid_all_publications.sql](sql/selecting_no_grid_all_publications.sql)    
32. [adding_grid_total_publications_to_visualization.sql](sql/adding_grid_total_publications_to_visualization.sql)
33. [adding_grid_total_publications_by_year_to_visualization.sql](sql/adding_grid_total_publications_by_year_to_visualization.sql)
34. `python3 all_papers.py all_paper_counts.jsonl`
35. Upload `all_paper_counts.jsonl` to `ai_companies_visualization.total_paper_counts` using the [all_papers_schema](schemas/all_papers_schema.json)
36. [adding_all_paper_counts.sql](sql/adding_all_paper_counts.sql)
37. [creating_workforce_visualization_data.sql](sql/creating_workforce_visualization_data.sql)
38. [adding_ai_jobs_to_workforce_visualization.sql](sql/adding_ai_jobs_to_workforce_visualization.sql)
39. [omitting_companies.sql](sql/omitting_companies.sql)
40. [omit_by_rule.sql](sql/omit_by_rule.sql)
41. [adding_crunchbase_company_metadata.sql](sql/adding_crunchbase_company_metadata.sql)