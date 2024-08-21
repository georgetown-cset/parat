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

To view the order of tasks necessary to build visualization data, see the airflow DAG.

# Deployment

To refresh the docker container (which you must do if you change any of the python scripts in parat_scripts/), run

```
docker build -t parat .
docker tag parat us-docker.pkg.dev/gcp-cset-projects/us.gcr.io/parat
docker push us-docker.pkg.dev/gcp-cset-projects/us.gcr.io/parat
```

# Adding a new company group

At the moment, you need to take the following steps:

1. Edit `sql/organizations.sql`, following the example of "S&P 500"
1. Edit `sql/initial_visualization_data.sql`, adding a new column for your new group 
1. Edit `sql/visualization_data_omit_by_rule.sql`, adding a new case for your new group
1. Edit `schemas/aggregated_organizations.json`, adding a new column for your new group
1. Edit `parat_scripts/aggregate_organizations.py`, following the example of S&P 500. Also update the docker container as described above
1. Edit `../web/retrieve_data.py`'s `clean` function, adding an object containing the new company group's metadata
1. Edit `../web/retrieve_data.py`'s `add_ranks` function, adding a new object to the `row_and_key_groups` array
1. Edit `../web/retrieve_data.py`'s `clean_misc_groups` function, adding a new object to the `group_keys_to_names` object
1. Edit these gui files following the example of the S&P 500 group:
```
../web/gui-v2/src/components/DetailViewPatents.jsx
../web/gui-v2/src/components/DetailViewPublications.jsx <-- do not edit the stat grid entries, these only reference S&P 500
```