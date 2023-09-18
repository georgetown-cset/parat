SELECT
  CSET_id,
  name,
  IF(parent_acquisition IS TRUE, TRUE, FALSE) as parent_acquisition,
  parent_name,
  parent_id,
  IF(TRIM(lower(comment)) != "checked", comment, NULL) as comment
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}