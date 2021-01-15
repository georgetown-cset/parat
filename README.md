# ai-companies-visualization

Before running script in the workspace:

1.) Make a new virtualenv:
 
 ```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2.) `export GOOGLE_APPLICATION_CREDENTIALS=<path to your credentials>` - a service account json.
You should have at least BQ reader permissions.

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
