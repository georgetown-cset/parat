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
4. [creating_initial_visualization_data_grid_publications.sql](sql/creating_initial_visualization_data_grid_publications.sql)
5. [adding_grid_ai_pubs_by_year_to_visualization.sql](sql/adding_grid_ai_pubs_by_year_to_visualization.sql)
6. [selecting_no_grid_ai_publications.sql](sql/selecting_no_grid_ai_publications.sql)
7. [selecting_grid_ai_patents_current_assignee.sql](sql/selecting_grid_ai_patents_current_assignee.sql)
8. [selecting_grid_ai_patents_original_assignee.sql](sql/selecting_grid_ai_patents_original_assignee.sql)
9. `python3 get_ai_counts.py ai_counts.jsonl` 
10. Upload `ai_counts.jsonl` to `ai_companies_visualization.paper_patent_counts` using the [counts_schema](schemas/counts_schema.json)
11. [adding_paper_patent_data.sql](sql/adding_paper_patent_data.sql)
12. [selecting_top_conference_pubs.sql](sql/selecting_top_conference_pubs.sql)
13. [pulling_publication_counts_in_top_ai_publications_grid.sql](sql/pulling_publication_counts_in_top_ai_publications_grid.sql)
14. [pulling_publication_counts_in_top_conferences_no_grid.sql](sql/pulling_publication_counts_in_top_conferences_no_grid.sql)
15. [adding_grid_ai_pubs_in_top_conferences_to_visualization.sql](sql/adding_grid_ai_pubs_in_top_conferences_to_visualization.sql)
16. [adding_grid_ai_pubs_in_top_conferences_by_year_to_visualization.sql](sql/adding_grid_ai_pubs_in_top_conferences_by_year_to_visualization.sql)
17. `python3 top_papers.py top_paper_counts.jsonl`
18. Upload `top_paper_counts.jsonl` to `ai_companies_visualization.top_paper_counts` using the [top_papers_schema](schemas/top_papers_schema.json)
19. [adding_top_paper_counts.sql](sql/adding_top_paper_counts.sql)
20. [selecting_grid_all_publications.sql](sql/selecting_grid_all_publications.sql)
21. [selecting_no_grid_all_publications.sql](sql/selecting_no_grid_all_publications.sql)    
22. [adding_grid_total_publications_to_visualization.sql](sql/adding_grid_total_publications_to_visualization.sql)
23. [adding_grid_total_publications_by_year_to_visualization.sql](sql/adding_grid_total_publications_by_year_to_visualization.sql)
24. `python3 all_papers.py all_paper_counts.jsonl`
25. Upload `all_paper_counts.jsonl` to `ai_companies_visualization.total_paper_counts` using the [all_papers_schema](schemas/all_papers_schema.json)
26. [adding_all_paper_counts.sql](sql/adding_all_paper_counts.sql)
27. [omitting_companies.sql](sql/omitting_companies.sql)
28. [omit_by_rule.sql](sql/omit_by_rule.sql)
29. [adding_crunchbase_company_metadata.sql](sql/adding_crunchbase_company_metadata.sql)