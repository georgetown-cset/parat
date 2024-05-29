SELECT
  * EXCEPT(new_cset_id),
  IF(ARRAY_LENGTH(new_cset_id) > 0, new_cset_id[0], null) AS new_cset_id
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}