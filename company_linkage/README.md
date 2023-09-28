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

1. [organizations.sql](sql/organizations.sql)
2. [ai_publications.sql](sql/ai_publications.sql)
3. [linked_ai_patents.sql](sql/linked_ai_patents.sql)
4. [top_conference_pubs.sql](sql/top_conference_pubs.sql)
5. [pubs_in_top_conferences.sql](sql/pubs_in_top_conferences.sql)
6. [all_publications.sql](sql/all_publications.sql)
7. `python3 aggregate_organizations.py aggregated_organizations.jsonl`
8. Replace `high_resolution_entities.aggregated_organizations` with the data from `aggregated_organizations.jsonl` using the [aggregated_organizations_schema](schemas/aggregated_organizations_schema.json)
9. `python3 get_ai_counts.py data/ai_company_papers.jsonl data/ai_company_patents.jsonl` 
10. Upload `ai_company_papers.jsonl` to `ai_companies_visualization.ai_company_pubs` using the [ai_papers_schema](schemas/ai_papers_schema.json)
11. Upload `ai_company_patents.jsonl` to `ai_companies_visualization.ai_company_patents` using the [ai_patents_schema](schemas/ai_patents_schema.json)
12. `python3 top_papers.py top_paper_counts.jsonl`
13. Upload `top_paper_counts.jsonl` to `ai_companies_visualization.top_paper_counts` using the [top_papers_schema](schemas/top_papers_schema.json)
14. `python3 all_papers.py all_paper_counts.jsonl`
15. Upload `all_paper_counts.jsonl` to `ai_companies_visualization.total_paper_counts` using the [all_papers_schema](schemas/all_papers_schema.json)
16. [creating_initial_visualization_data_publications.sql](sql/creating_initial_visualization_data_publications.sql)
17. [adding_ai_pubs_by_year_to_visualization.sql](sql/adding_ai_pubs_by_year_to_visualization.sql)
18. [creating_patent_visualization_data.sql](sql/creating_patent_visualization_data.sql)
19. [adding_ai_patents_by_year_to_visualization.sql](sql/adding_ai_patents_by_year_to_visualization.sql)
20. [creating_paper_visualization_data.sql](sql/creating_paper_visualization_data.sql)
21. [adding_top_mag_ai_fields.sql](sql/adding_top_mag_ai_fields.sql)
22. [adding_top_science_map_clusters.sql](sql/adding_top_science_map_clusters.sql)
23. [adding_company_references.sql](sql/adding_company_references.sql)
24. [adding_top_tasks.sql](sql/adding_top_tasks.sql)
25. [adding_top_methods.sql](sql/adding_top_methods.sql)
26. [adding_top_paper_counts.sql](sql/adding_top_paper_counts.sql)
27. [adding_all_paper_counts.sql](sql/adding_all_paper_counts.sql)
28. [creating_workforce_visualization_data.sql](sql/creating_workforce_visualization_data.sql)
29. [adding_ai_jobs_to_workforce_visualization.sql](sql/adding_ai_jobs_to_workforce_visualization.sql)
30. [omit_by_rule.sql](sql/omit_by_rule.sql)
31. [omit_by_rule_papers.sql](sql/omit_by_rule_papers.sql)
32. [omit_by_rule_patents.sql](sql/omit_by_rule_patents.sql)
33. [omit_by_rule_workforce.sql](sql/omit_by_rule_workforce.sql)
34. [adding_crunchbase_company_metadata.sql](sql/adding_crunchbase_company_metadata.sql)

# Deployment

To refresh the docker container (which you must do if you change any of the python scripts in parat_scripts/), run

```
docker build -t parat .
docker tag parat us.gcr.io/gcp-cset-projects/parat
docker push us.gcr.io/gcp-cset-projects/parat
```