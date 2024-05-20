SELECT
  {{ params.staging_table_name }}.name,
  organizations.CSET_id
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}
LEFT JOIN
  UNNEST(CSET_ids) AS airtable_cset_id
LEFT JOIN
  `{{ params.staging_dataset }}.000_main_raw` as organizations
ON organizations.airtable_id = airtable_cset_id