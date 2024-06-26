gsutil rm -r gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/airtable_to_bq_config/parat_preannotation/*
gsutil rm -r gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/airtable_to_bq_config/parat_validate/*

gsutil cp -r airtable_configs/parat_preannotation gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/airtable_to_bq_config/
gsutil cp -r airtable_configs/parat_validate gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/airtable_to_bq_config/
gsutil cp -r airtable_configs/company_annotation gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/airtable_to_bq_config/

gsutil cp airtable_queries/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/sql/airtable_to_bq/parat_preannotation/
gsutil cp airtable_queries/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/sql/airtable_to_bq/parat_validate/
gsutil cp airtable_queries/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/sql/airtable_to_bq/company_annotation/
gsutil cp airtable_schemas/parat_preannotation/* gs://airflow-data-exchange/schemas/airtable_to_bq/parat_preannotation/
gsutil cp airtable_schemas/parat_validate/* gs://airflow-data-exchange/schemas/airtable_to_bq/parat_validate/
gsutil cp airtable_schemas/company_annotation/* gs://airflow-data-exchange/schemas/airtable_to_bq/company_annotation/

gsutil cp parat_data_dag.py gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/
gsutil cp sequences/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/sequences/parat/
gsutil rm gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/sql/parat/*
gsutil cp sql/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/sql/parat/
gsutil cp schemas/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/schemas/parat/
gsutil rm -r gs://airflow-data-exchange/parat/schemas/*
gsutil cp schemas/* gs://airflow-data-exchange/parat/schemas/
gsutil -m cp -r parat_scripts/* gs://us-east1-production-cc2-202-b42a7a54-bucket/dags/parat_scripts/
