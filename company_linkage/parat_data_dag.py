import os
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator, BigQueryCheckOperator
from airflow.providers.google.cloud.transfers.bigquery_to_bigquery import BigQueryToBigQueryOperator
from airflow.providers.google.cloud.operators.kubernetes_engine import GKEStartPodOperator
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from airflow.operators.dummy import DummyOperator
from airflow.providers.google.cloud.operators.gcs import GCSDeleteObjectsOperator
from dataloader.airflow_utils.defaults import (
    DATA_BUCKET,
    PROJECT_ID,
    GCP_ZONE,
    DAGS_DIR,
    get_default_args,
    get_post_success,
)
from dataloader.scripts.populate_documentation import update_table_descriptions

bucket = DATA_BUCKET
initial_dataset = "parat_input"
intermediate_dataset = "high_resolution_entities"
production_dataset = "ai_companies_visualization"
staging_dataset = f"staging_{production_dataset}"
backups_dataset = f"{production_dataset}_backups"
sql_dir = "sql/parat"
schema_dir = "parat/schemas"
tmp_dir = f"{production_dataset}/tmp"

default_args = get_default_args(pocs=["Rebecca"])
date = datetime.now().strftime("%Y%m%d")


# Part 2: Get data from airtable and update databases
dag = DAG(
    "parat",
    default_args=default_args,
    description="PARAT data updater",
    schedule_interval="0 10 5 * *",
    catchup=False,
    user_defined_macros={
        "staging_dataset": staging_dataset,
        "production_dataset": production_dataset,
        "intermediate_dataset": intermediate_dataset,
        "initial_dataset": initial_dataset,
        "backups_dataset": backups_dataset,
    },
)
with dag:

    clear_tmp_dir = GCSDeleteObjectsOperator(
        task_id="clear_tmp_dir",
        bucket_name=DATA_BUCKET,
        prefix=tmp_dir
    )

    # Do initial query sequence

    wait_for_initial_tables = DummyOperator(task_id="wait_for_initial_tables")

    seq_path_prefix = f"{os.environ.get('DAGS_FOLDER')}/sequences/parat/"
    initial_query_sequence = "initial_data.csv"

    curr = clear_tmp_dir
    for line in open(seq_path_prefix + initial_query_sequence).readlines():
        dataset, table = line.split(",")
        table = table.strip()
        table_name = f"{dataset}.{table}"
        next_tab = BigQueryInsertJobOperator(
            task_id=f"create_{table_name}",
            configuration={
                "query": {
                    "query": "{% include '" + f"{sql_dir}/{table}.sql" + "' %}",
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

    aggregate_organizations = GKEStartPodOperator(
        task_id="aggregate_organizations",
        project_id=PROJECT_ID,
        location=GCP_ZONE,
        cluster_name="cc2-task-pool",
        name="parat-aggregate-organizations",
        cmds=["/bin/bash"],
        arguments=["-c", (f"echo 'aggregating organizations!' ; rm -r ai || true ; "
                          f"mkdir -p ai && "
                          f"python3 aggregate_organizations.py --output_file ai/{aggregated_table}.jsonl --from_airflow")],
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
                                "parat-pool",
                            ]
                        }]
                    }]
                }
            }
        }
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

    start_visualization_tables = DummyOperator(task_id="start_visualization_tables")
    wait_for_visualization_tables = DummyOperator(task_id="wait_for_visualization_tables")

    visualization_query_sequence = "visualization_data.csv"

    curr = start_visualization_tables
    for line in open(seq_path_prefix + visualization_query_sequence).readlines():
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
    curr >> wait_for_visualization_tables

    checks = []
    for query in os.listdir(f"{DAGS_DIR}/{sql_dir}"):
        if not query.startswith("check_"):
            continue
        checks.append(BigQueryCheckOperator(
            task_id=query.replace(".sql", ""),
            sql=f"{sql_dir}/{query}",
            use_legacy_sql=False
        ))

    wait_for_checks = DummyOperator(task_id="wait_for_checks")

    wait_for_copy = DummyOperator(task_id="wait_for_copy")

    curr_date = datetime.now().strftime('%Y%m%d')
    prod_tables = ["visualization_data", "paper_visualization_data", "original_company_names",
                   "patent_visualization_data", "workforce_visualization_data", "all_visualization_data"]
    for table in prod_tables:
        prod_table_name = f"{production_dataset}.{table}"
        copy_to_production = BigQueryToBigQueryOperator(
            task_id="copy_" + table + "_to_production",
            source_project_dataset_tables=[staging_dataset + "." + table],
            destination_project_dataset_table=prod_table_name,
            create_disposition="CREATE_IF_NEEDED",
            write_disposition="WRITE_TRUNCATE"
        )
        table_backup = BigQueryToBigQueryOperator(
            task_id=f"back_up_{table}",
            source_project_dataset_tables=[f"{staging_dataset}.{table}"],
            destination_project_dataset_table=f"{backups_dataset}.{table}_{curr_date}",
            create_disposition="CREATE_IF_NEEDED",
            write_disposition="WRITE_TRUNCATE"
        )
        if table != "all_visualization_data":
            pop_descriptions = PythonOperator(
                task_id="populate_column_documentation_for_" + table,
                op_kwargs={
                    "input_schema": f"{os.environ.get('DAGS_FOLDER')}/schemas/parat/{table}.json",
                    "table_name": prod_table_name
                },
                python_callable=update_table_descriptions
            )
            wait_for_checks >> copy_to_production >> pop_descriptions >> table_backup >> wait_for_copy
        else:
            wait_for_checks >> copy_to_production >> table_backup >> wait_for_copy

    # post success to slack
    msg_success = get_post_success("PARAT tables updated!", dag)

    (
        wait_for_initial_tables
        >> aggregate_organizations
        >> load_aggregated_orgs
        >> start_visualization_tables
    )
    (
        wait_for_visualization_tables
        >> checks
        >> wait_for_checks
    )
    (
        wait_for_copy
        >> msg_success
    )

