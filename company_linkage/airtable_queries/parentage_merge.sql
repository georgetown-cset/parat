SELECT
  * EXCEPT(new_cset_id, parent_id),
  IF(ARRAY_LENGTH(new_cset_id) > 0, new_cset_id[0], null) AS new_cset_id,
  IF(ARRAY_LENGTH(parent_id) > 0, parent_id[0], null) AS parent_id
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}
WHERE
  (ARRAY_LENGTH(parent_id) > 0) and (parent_id[0] is not null)