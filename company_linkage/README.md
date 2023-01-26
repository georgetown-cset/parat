# AI Companies Visualization

## What is in the workspace

* SQL (see order to run below)
* Schemas for the tables that need to be loaded to BigQuery.
* A Python script to aggregate our initial organization list into parent organizations. This can be run on any organization list.  
* Python scripts for getting AI paper/patent counts, top conference paper, and total papers counts
* A Python script used to do a one time clean up/deduplication for the initial company data in the visualization
* Unit tests for the Python script to get counts. As the same functions are used in the
script to get top conference papers and total papers, these tests will work for all of them.
* A unit test for the Python script to aggregate our initial organization list.

This code is dependent on internal CSET BigQuery datasets; without access to these datasets, you will not be able to
run some of this code as-is.

## Tasks to build visualization data

1. [creating_organizations_from_airtable_imports.sql](sql/create_organizations_from_airtable_imports.sql)
2. [selecting_ai_publications.sql](sql/selecting_ai_publications.sql)
3. `python3 aggregate_organizations.py aggregated_organizations.jsonl`
4. Replace `high_resolution_entities.aggregated_organizations` with the data from `aggregated_organizations.jsonl` using the [aggregated_organizations_schema](schemas/aggregated_organizations_schema.json)
5. [selecting_ai_patents.sql](sql/selecting_ai_patents.sql)
6. `python3 get_ai_counts.py data/ai_company_papers.jsonl data/ai_company_patents.jsonl` 
7. Upload `ai_company_papers.jsonl` to `ai_companies_visualization.ai_company_pubs` using the [ai_papers_schema](schemas/ai_papers_schema.json)
8. Upload `ai_company_patents.jsonl` to `ai_companies_visualization.ai_company_patents` using the [ai_patents_schema](schemas/ai_patents_schema.json)
9. [creating_initial_visualization_data_publications.sql](sql/creating_initial_visualization_data_publications.sql)
10. [adding_ai_pubs_by_year_to_visualization.sql](sql/adding_ai_pubs_by_year_to_visualization.sql)
11. [creating_patent_visualization_data.sql](sql/creating_patent_visualization_data.sql)
12. [adding_ai_patents_by_year_to_visualization.sql](sql/adding_ai_patents_by_year_to_visualization.sql)
13. [creating_paper_visualization_data.sql](sql/creating_paper_visualization_data.sql)
14. [adding_top_mag_ai_fields.sql](sql/adding_top_mag_ai_fields.sql)
15. [adding_top_science_map_clusters.sql](sql/adding_top_science_map_clusters.sql)
16. [adding_company_references.sql](sql/adding_company_references.sql)
17. [adding_top_tasks.sql](sql/adding_top_tasks.sql)
18. [adding_top_methods.sql](sql/adding_top_methods.sql)
19. [selecting_top_conference_pubs.sql](sql/selecting_top_conference_pubs.sql)
20. [pulling_publications_in_top_ai_conferences.sql](sql/pulling_publications_in_top_ai_conferences.sql)
21. `python3 top_papers.py top_paper_counts.jsonl`
22. Upload `top_paper_counts.jsonl` to `ai_companies_visualization.top_paper_counts` using the [top_papers_schema](schemas/top_papers_schema.json)
23. [adding_top_paper_counts.sql](sql/adding_top_paper_counts.sql)
24. [selecting_all_publications.sql](sql/selecting_all_publications.sql)
25. `python3 all_papers.py all_paper_counts.jsonl`
26. Upload `all_paper_counts.jsonl` to `ai_companies_visualization.total_paper_counts` using the [all_papers_schema](schemas/all_papers_schema.json)
27. [adding_all_paper_counts.sql](sql/adding_all_paper_counts.sql)
28. [creating_workforce_visualization_data.sql](sql/creating_workforce_visualization_data.sql)
29. [adding_ai_jobs_to_workforce_visualization.sql](sql/adding_ai_jobs_to_workforce_visualization.sql)
31. [omit_by_rule.sql](sql/omit_by_rule.sql)
32. [omit_by_rule_papers.sql](sql/omit_by_rule_papers.sql)
33. [omit_by_rule_patents.sql](sql/omit_by_rule_patents.sql)
34. [omit_by_rule_workforce.sql](sql/omit_by_rule_workforce.sql)
35. [adding_crunchbase_company_metadata.sql](sql/adding_crunchbase_company_metadata.sql)