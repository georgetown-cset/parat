SELECT
  {{ params.staging_table_name }}.* EXCEPT(airtable_ids),
  organizations.CSET_id
FROM
  {{ params.staging_dataset }}.{{ params.staging_table_name }}
LEFT JOIN
  UNNEST(airtable_ids) AS airtable_id
LEFT JOIN
  `{{ params.staging_dataset }}.000_main_raw` as organizations
USING (airtable_id)