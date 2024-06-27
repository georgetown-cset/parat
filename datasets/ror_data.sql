-- Aggregate organizations with publications but no ror id for manual checking and then submission to ROR
CREATE OR REPLACE TABLE
  staging_ai_companies_visualization.ror_data AS
WITH
  clean_aliases AS (
  SELECT
    cset_id,
    ARRAY_TO_STRING(ARRAY_AGG(alias.alias), ";") AS name_variants
  FROM
    ai_companies_visualization.all_visualization_data
  CROSS JOIN
    UNNEST(aliases) AS alias
  WHERE
    LOWER(name) != LOWER(alias.alias)
  GROUP BY
    cset_id ),
  grids AS (
  SELECT
    COALESCE(legacy_cset_id, 4000+new_cset_id) AS cset_id,
    ARRAY_TO_STRING(ARRAY_AGG(external_id), ";") AS grid_id
  FROM
    parat_input.ids
  INNER JOIN
    parat_input.organizations
  USING
    (new_cset_id)
  WHERE
    SOURCE = "GRID"
  GROUP BY
    cset_id )
SELECT
  all_visualization_data.name,
  "active" AS status,
  NULL AS other_language,
  name_variants,
  NULL AS acronym,
  all_visualization_data.website,
  NULL AS publications,
IF
  (CONTAINS_SUBSTR(description_source, "wikipedia"), description_link, NULL) AS wiki_page,
  NULL AS wiki_id,
  NULL AS isni_id,
  grid_id,
  NULL AS crossref_id,
  "Company" AS org_type,
  NULL AS year_est,
  NULL AS parent,
  NULL AS child,
  NULL AS related,
  city,
  standard_name AS country,
  NULL AS comments
FROM
  ai_companies_visualization.all_visualization_data
LEFT JOIN
  clean_aliases
USING
  (cset_id)
LEFT JOIN
  grids
USING
  (cset_id)
LEFT JOIN
  parat_input.organizations
ON
  cset_id = COALESCE(legacy_cset_id, 4000+new_cset_id)
LEFT JOIN (
  SELECT
    DISTINCT standard_name,
    raw_alpha_3
  FROM
    countries.country_code) AS country_mapping
ON
  all_visualization_data.country = raw_alpha_3
WHERE
  (all_pubs > 5)
  AND (ARRAY_LENGTH(ror_id) = 0)
  AND (all_visualization_data.name NOT IN (
    SELECT
      SPLIT(name, " (")[0]
    FROM
      gcp_cset_ror.ror))
  AND (all_visualization_data.name NOT IN (
    SELECT
      SPLIT(alias, " (")[0]
    FROM
      gcp_cset_ror.ror
    CROSS JOIN
      UNNEST(aliases) AS alias))
ORDER BY
  all_pubs desc