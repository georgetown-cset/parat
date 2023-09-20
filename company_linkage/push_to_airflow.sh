gsutil rm -r gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/airtable_to_bq_config/parat_preannotation/*
gsutil rm -r gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/airtable_to_bq_config/parat_validate/*

gsutil cp -r airtable_configs/parat_preannotation gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/airtable_to_bq_config/
gsutil cp -r airtable_configs/parat_validate gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/airtable_to_bq_config/
gsutil cp airtable_queries/parat_preannotation/* gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/sql/bq_to_airtable/parat_preannotation/
gsutil cp airtable_queries/parat_preannotation/* gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/sql/bq_to_airtable/parat_validate/

gsutil cp airtable_queries/* gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/sql/airtable_to_bq/parat_preannotation/
gsutil cp airtable_queries/* gs://us-east1-dev2023-cc1-b088c7e1-bucket/dags/sql/airtable_to_bq/parat_validate/
gsutil cp airtable_schemas/parat_preannotation/* gs://airflow-data-exchange-development/schemas/airtable_to_bq/parat_preannotation/
gsutil cp airtable_schemas/parat_validate/* gs://airflow-data-exchange-development/schemas/airtable_to_bq/parat_validate/