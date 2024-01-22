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
docker tag parat us.gcr.io/gcp-cset-projects/parat
docker push us.gcr.io/gcp-cset-projects/parat
```