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
16. [initial_visualization_data.sql](sql/initial_visualization_data.sql)
17. [visualization_data_with_by_year.sql](sql/visualization_data_with_by_year.sql)
18. [initial_patent_visualization_data.sql](sql/initial_patent_visualization_data.sql)
19. [patent_visualization_data_with_by_year.sql](sql/patent_visualization_data_with_by_year.sql)
20. [initial_paper_visualization_data.sql](sql/initial_paper_visualization_data.sql)
21. [paper_visualization_data_with_mag.sql](sql/paper_visualization_data_with_mag.sql)
22. [paper_visualization_data_with_clusters.sql](sql/paper_visualization_data_with_clusters.sql)
23. [paper_visualization_data_with_company_references.sql](sql/paper_visualization_data_with_company_references.sql)
24. [paper_visualization_data_with_tasks.sql](sql/paper_visualization_data_with_tasks.sql)
25. [paper_visualization_data_with_methods.sql](sql/paper_visualization_data_with_methods.sql)
26. [visualization_data_with_top_papers.sql](sql/visualization_data_with_top_papers.sql)
27. [visualization_data_with_all_papers.sql](sql/visualization_data_with_all_papers.sql)
28. [initial_workforce_visualization_data.sql](sql/initial_workforce_visualization_data.sql)
29. [workforce_visualization_data_with_ai_jobs.sql](sql/workforce_visualization_data_with_ai_jobs.sql)
30. [visualization_data_omit_by_rule.sql](sql/visualization_data_omit_by_rule.sql)
31. [paper_visualization_data.sql](sql/paper_visualization_data.sql)
32. [patent_visualization_data.sql](sql/patent_visualization_data.sql)
33. [workforce_visualization_data.sql](sql/workforce_visualization_data.sql)
34. [visualization_data.sql](sql/visualization_data.sql)

# Deployment

To refresh the docker container (which you must do if you change any of the python scripts in parat_scripts/), run

```
docker build -t parat .
docker tag parat us.gcr.io/gcp-cset-projects/parat
docker push us.gcr.io/gcp-cset-projects/parat
```