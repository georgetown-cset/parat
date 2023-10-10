import os
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.trigger_dagrun import TriggerDagRunOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator
from airflow.providers.google.cloud.operators.cloud_sql import (
    CloudSQLImportInstanceOperator,
)
from airflow.providers.google.cloud.operators.kubernetes_engine import GKEStartPodOperator
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from airflow.operators.dummy import DummyOperator
from airflow.providers.google.cloud.operators.gcs import GCSDeleteObjectsOperator
from airflow.providers.google.cloud.transfers.bigquery_to_gcs import (
    BigQueryToGCSOperator,
)
from dataloader.airflow_utils.defaults import (
    DATA_BUCKET,
    PROJECT_ID,
    GCP_ZONE,
    get_default_args,
    get_post_success,
)
from dataloader.scripts.populate_documentation import update_table_descriptions
from parat_scripts.aggregate_organizations import aggregate_organizations

bucket = DATA_BUCKET
initial_dataset = "parat_input"
intermediate_dataset = "high_resolution_entities"
production_dataset = "ai_companies_visualization"
staging_dataset = f"staging_{production_dataset}"
sql_dir = "sql/parat"
schema_dir = "parat/schemas"
tmp_dir = f"{production_dataset}/tmp"

default_args = get_default_args()
date = datetime.now().strftime("%Y%m%d")


# Part 2: Get data from airtable and update databases
dag = DAG(
    "parat",
    default_args=default_args,
    description="PARAT data updater",
    schedule_interval=None,
    catchup=False,
    user_defined_macros={
        "staging_dataset": staging_dataset,
        "production_dataset": production_dataset,
        "intermediate_dataset": intermediate_dataset,
        "initial_dataset": initial_dataset
    },
)
with dag:

    clear_tmp_dir = GCSDeleteObjectsOperator(
        task_id="clear_tmp_dir",
        bucket_name=DATA_BUCKET,
        prefix=tmp_dir
    )

    # combine all the airtable tables into joined tables

    start = DummyOperator(task_id="starting")

    join_tables = []
    for table in ["alias", "grid", "ids", "linkedin", "market", "organizations", "parent", "permid"]:

        # Grab all the data and write it to unseen_en_corpus
        join_table = BigQueryInsertJobOperator(
            task_id=f"join_{table}",
            configuration={
                "query": {
                    "query": f"select distinct * from {initial_dataset}.{table}_preannotation UNION DISTINCT "
                             f"select distinct * from {initial_dataset}.{table}_validate",
                    "useLegacySql": False,
                    "destinationTable": {
                        "projectId": PROJECT_ID,
                        "datasetId": initial_dataset,
                        "tableId": f"{table}_joined"
                    },
                    "allowLargeResults": True,
                    "createDisposition": "CREATE_IF_NEEDED",
                    "writeDisposition": "WRITE_TRUNCATE"
                }
            }
        )
        join_tables.append(join_table)

    # Do initial query sequence

    start_initial_tables = DummyOperator(task_id="start_initial_tables")

    wait_for_initial_tables = DummyOperator(task_id="wait_for_initial_tables")

    seq_path_prefix = f"{os.environ.get('DAGS_FOLDER')}/sequences/parat/"
    initial_query_sequence = "initial_data.csv"

    curr = start_initial_tables
    for line in open(seq_path_prefix + initial_query_sequence).readlines():
        dataset, table = line.split(",")
        table_name = f"{dataset}.{table.strip()}"
        next_tab = BigQueryInsertJobOperator(
            task_id=f"create_{table_name}",
            configuration={
                "query": {
                    "query": "{% include '" + f"{sql_dir}/{table.strip()}.sql" + "' %}",
                    "useLegacySql": False,
                    "destinationTable": {
                        "projectId": PROJECT_ID,
                        "datasetId": dataset,
                        "tableId": table
                    },
                    "allowLargeResults": True,
                    "createDisposition": "CREATE_IF_NEEDED",
                    "writeDisposition": "WRITE_TRUNCATE"
                }
            },
        )
        curr >> next_tab
        curr = next_tab
    curr >> wait_for_initial_tables

    # run aggregate_organizations python and load to GCS
    aggregated_table = "aggregated_organizations"

    aggregate_organizations = PythonOperator(
        task_id="aggregate_organizations",
        op_kwargs={
            "output_file": f"{aggregated_table}.jsonl"
        },
        python_callable=aggregate_organizations,
    )

    # load aggregated_organizations to BigQuery

    load_aggregated_orgs = GCSToBigQueryOperator(
        task_id=f"load_{aggregated_table}",
        bucket=DATA_BUCKET,
        source_objects=[f"{tmp_dir}/{aggregated_table}.jsonl"],
        schema_object=f"{schema_dir}/{aggregated_table}.json",
        destination_project_dataset_table=f"{intermediate_dataset}.{aggregated_table}",
        source_format="NEWLINE_DELIMITED_JSON",
        create_disposition="CREATE_IF_NEEDED",
        write_disposition="WRITE_TRUNCATE"
    )

    # TODO: somewhere in here we need to decide whether to load directly to the main table
    # or to add a transfer step to transfer from staging to the main table; if the latter
    # are there checks we want to add first?
    # for now, pretend the data is in the main table already

    run_get_ai_counts = GKEStartPodOperator(
        task_id="run_get_ai_counts",
        project_id=PROJECT_ID,
        location=GCP_ZONE,
        cluster_name="us-east1-production2023-cc1-01d75926-gke",
        name="run_get_ai_counts",
        cmds=["/bin/bash"],
        arguments=["-c", (f"echo 'getting AI counts!' ; rm -r ai || true ; "
                          f"mkdir -p ai && "
                          f"python3 get_ai_counts.py ai/ai_company_papers.jsonl ai/ai_company_patents.jsonl"
                          f"gsutil -m cp -r ai gs://{DATA_BUCKET}/{tmp_dir}/ ")],
        namespace="default",
        image=f"us.gcr.io/{PROJECT_ID}/parat",
        get_logs=True,
        startup_timeout_seconds=300,
        # see also https://cloud.google.com/composer/docs/how-to/using/using-kubernetes-pod-operator#affinity-config
        affinity={
            "nodeAffinity": {
                "requiredDuringSchedulingIgnoredDuringExecution": {
                    "nodeSelectorTerms": [{
                        "matchExpressions": [{
                            "key": "cloud.google.com/gke-nodepool",
                            "operator": "In",
                            "values": [
                                "default-pool",
                            ]
                        }]
                    }]
                }
            }
        }
    )

    load_ai_papers = GCSToBigQueryOperator(
        task_id=f"load_ai_company_papers",
        bucket=DATA_BUCKET,
        source_objects=[f"{tmp_dir}/ai_company_papers.jsonl"],
        schema_object=f"{schema_dir}/ai_papers_schema.json",
        destination_project_dataset_table=f"{staging_dataset}.ai_company_papers",
        source_format="NEWLINE_DELIMITED_JSON",
        create_disposition="CREATE_IF_NEEDED",
        write_disposition="WRITE_TRUNCATE"
    )

    load_ai_patents = GCSToBigQueryOperator(
        task_id=f"load_ai_company_patents",
        bucket=DATA_BUCKET,
        source_objects=[f"{tmp_dir}/ai_company_patents.jsonl"],
        schema_object=f"{schema_dir}/ai_patents_schema.json",
        destination_project_dataset_table=f"{staging_dataset}.ai_company_patents",
        source_format="NEWLINE_DELIMITED_JSON",
        create_disposition="CREATE_IF_NEEDED",
        write_disposition="WRITE_TRUNCATE"
    )

    run_papers = []
    for paper_type in ["top", "all"]:

        run_get_paper_counts = GKEStartPodOperator(
            task_id=f"run_get_{paper_type}_counts",
            project_id=PROJECT_ID,
            location=GCP_ZONE,
            cluster_name="us-east1-production2023-cc1-01d75926-gke",
            name=f"run_get_{paper_type}_counts",
            cmds=["/bin/bash"],
            arguments=["-c", (f"echo 'getting {paper_type} paper counts!' ; rm -r {paper_type} || true ; "
                              f"mkdir -p {paper_type} && "
                              f"python3 {paper_type}_papers.py {paper_type}/{paper_type}_paper_counts.jsonl"
                              f"gsutil -m cp -r {paper_type} gs://{DATA_BUCKET}/{tmp_dir}/ ")],
            namespace="default",
            image=f"us.gcr.io/{PROJECT_ID}/parat",
            get_logs=True,
            startup_timeout_seconds=300,
            # see also https://cloud.google.com/composer/docs/how-to/using/using-kubernetes-pod-operator#affinity-config
            affinity={
                "nodeAffinity": {
                    "requiredDuringSchedulingIgnoredDuringExecution": {
                        "nodeSelectorTerms": [{
                            "matchExpressions": [{
                                "key": "cloud.google.com/gke-nodepool",
                                "operator": "In",
                                "values": [
                                    "default-pool",
                                ]
                            }]
                        }]
                    }
                }
            }
        )
        run_papers.append(run_get_paper_counts)

    # even though these are near-identical we do these in sequence -- we'd have to put in a dummy operator
    # otherwise anyway and they should be fast

    load_top_papers = GCSToBigQueryOperator(
        task_id=f"load_top_papers",
        bucket=DATA_BUCKET,
        source_objects=[f"{tmp_dir}/top_paper_counts.jsonl"],
        schema_object=f"{schema_dir}/top_papers_schema.json",
        destination_project_dataset_table=f"{staging_dataset}.top_paper_counts",
        source_format="NEWLINE_DELIMITED_JSON",
        create_disposition="CREATE_IF_NEEDED",
        write_disposition="WRITE_TRUNCATE"
    )

    load_all_papers = GCSToBigQueryOperator(
        task_id=f"load_all_papers",
        bucket=DATA_BUCKET,
        source_objects=[f"{tmp_dir}/all_paper_counts.jsonl"],
        schema_object=f"{schema_dir}/all_papers_schema.json",
        destination_project_dataset_table=f"{staging_dataset}.all_paper_counts",
        source_format="NEWLINE_DELIMITED_JSON",
        create_disposition="CREATE_IF_NEEDED",
        write_disposition="WRITE_TRUNCATE"
    )





    (
        clear_tmp_dir
        >> start
        >> join_tables
        >> start_initial_tables
    )
    (
        wait_for_initial_tables
        >> aggregate_organizations
        >> load_aggregated_orgs
        >> run_get_ai_counts
        >> load_ai_papers
        >> load_ai_patents
        >> run_papers
        >> load_top_papers
        >> load_all_papers
    )

