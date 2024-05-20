SELECT
  * EXCEPT(CSET_id, parent_id),
  IF(ARRAY_LENGTH(CSET_id) > 0, CSET_id[0], null) AS CSET_id,
  IF(ARRAY_LENGTH(parent_id) > 0, parent_id[0], null) AS parent_id
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}