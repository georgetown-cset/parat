SELECT
  * EXCEPT(include)
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}
WHERE
  include