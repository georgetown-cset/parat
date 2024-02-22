SELECT
  CSET_id,
  name,
  city,
  province_state,
  country,
  website,
  IF(in_fortune_global_500 IS TRUE, TRUE, FALSE) as in_fortune_global_500,
  IF(in_sandp_500 IS TRUE, TRUE, FALSE) as in_sandp_500,
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}