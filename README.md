# AI Companies Visualization

Before running scripts in the workspace:

1.) Make a new virtualenv:
 
 ```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2.) `export GOOGLE_APPLICATION_CREDENTIALS=<path to your credentials>` - a service account json.
You should have at least BQ reader permissions.

## What is in the workspace

* SQL (see order to run below)
* Schemas for the two tables that need to be loaded to BigQuery
* Python scripts for getting AI paper/patent counts and top conference paper counts
* A Python script used to do a one time clean up/deduplication for the initial company data in the visualization
* Unit tests for the Python script to get counts.

## Tasks to build visualization

1. [selecting_grid_ai_publications.sql](sql/selecting_grid_ai_publications.sql)
2. [creating_initial_visualization_data_grid_publications.sql](sql/creating_initial_visualization_data_grid_publications.sql)
3. [selecting_no_grid_ai_publications.sql](sql/selecting_no_grid_ai_publications.sql)
4. [selecting_grid_ai_patents_current_assignee.sql](sql/selecting_grid_ai_patents_current_assignee.sql)
5. [sselecting_grid_ai_patents_original_assignee.sql](sql/selecting_grid_ai_patents_original_assignee.sql)
6. `python3 get_ai_counts.py ai_counts.jsonl` 
7. Upload `ai_counts.jsonl` to `ai_companies_visualization.paper_patent_counts`
8. [adding_paper_patent_data.sql](sql/adding_paper_patent_data.sql)
9. [pulling_publication_counts_in_top_ai_publications_grid.sql](sql/pulling_publication_counts_in_top_ai_publications_grid.sql)
10. [adding_grid_ai_pubs_in_top_conferences_to_visualization.sql](sql/adding_grid_ai_pubs_in_top_conferences_to_visualization.sql)
11. `python3 top_papers.py top_paper_counts.jsonl`
12. Upload `top_paper_counts.jsonl` to `ai_companies_visualization.top_paper_counts`
13. [adding_top_paper_counts.sql](sql/adding_top_paper_counts.sql)