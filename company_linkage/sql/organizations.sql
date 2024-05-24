WITH sp_500 AS (
  SELECT DISTINCT
    new_cset_id
  FROM
    parat_input.groups
  where
    name = "S&P 500"
),
global_500 AS (
  SELECT DISTINCT
    new_cset_id
  FROM
    parat_input.groups
  where
    name = "Global 500"
)
SELECT
  * REPLACE( (
    SELECT
      ARRAY_AGG(STRUCT(alias_language,
          alias))
    FROM (
      SELECT
        DISTINCT alias_language,
        alias
      FROM
        UNNEST(aliases) a )) AS aliases, (
    SELECT
      ARRAY_AGG(STRUCT(parent_acquisition,
          parent_name,
          parent_id))
    FROM (
      SELECT
        DISTINCT parent_acquisition,
        parent_name,
        parent_id
      FROM
        UNNEST(parent) p )) AS parent, (
    SELECT
      ARRAY_AGG(STRUCT(exchange,
          ticker))
    FROM (
      SELECT
        DISTINCT exchange,
        ticker
      FROM
        UNNEST(market) m )) AS market )
FROM (
  SELECT
    COALESCE(legacy_cset_id, 4000+new_cset_id) AS CSET_id,
    organizations.name,
    STRUCT(city,
      province_state,
      organizations.country) AS location,
    description.description,
    description_source,
    description_link,
    description.retrieval_date as description_retrieval_date,
    website,
    ARRAY_AGG(STRUCT(aliases.alias_language,
        alias)) AS aliases,
    ARRAY_AGG(STRUCT(CASE
          WHEN parentage.parent_acquisition IS TRUE THEN TRUE
        ELSE
        FALSE
      END
        AS parent_acquisition,
        parent_name,
        parent_id)) AS parent,
    ARRAY_AGG(DISTINCT IF(source = "PermID", external_id, null) IGNORE NULLS)[0] AS permid,
    ARRAY_AGG(STRUCT(market as exchange,
        ticker)) AS market,
    ARRAY_AGG(DISTINCT IF(source = "Crunchbase UUID", external_id, null) IGNORE NULLS)[0] AS crunchbase_uuid,
    ARRAY_AGG(DISTINCT IF(source = "Crunchbase URL", external_id, null) IGNORE NULLS)[0] AS crunchbase_url,
    ARRAY_AGG(DISTINCT ror.id IGNORE NULLS) AS ror_id,
    ARRAY_AGG(DISTINCT IF(source = "Regex", external_id, null) IGNORE NULLS) AS regex,
    ARRAY_AGG(DISTINCT IF(source = "BGOV", external_id, null) IGNORE NULLS) AS BGOV_id,
    ARRAY_AGG(DISTINCT IF(source = "LinkedIn", external_id, null) IGNORE NULLS) AS linkedin,
    sp_500.new_cset_id IS NOT NULL AS in_sandp_500,
    global_500.new_cset_id IS NOT NULL AS in_fortune_global_500
  FROM
    parat_input.organizations
  LEFT JOIN
    parat_input.aliases
  USING
    (new_cset_id)
  LEFT JOIN
    parat_input.parentage
  USING
    (new_cset_id)
  LEFT JOIN
    parat_input.ids
  USING
    (new_cset_id)
  LEFT JOIN
    parat_input.tickers
  USING
    (new_cset_id)
  LEFT JOIN
    parat_input.description
  USING
    (new_cset_id)
  LEFT JOIN
    gcp_cset_ror.ror
  ON
    TRIM(ids.external_id) = external_ids.GRID.all and ids.source = "GRID"
  LEFT JOIN
    sp_500
  USING
    (new_cset_id)
  LEFT JOIN
    global_500
  USING
    (new_cset_id)
  GROUP BY
    new_cset_id,
    name,
    city,
    province_state,
    organizations.country,
    description,
    description_source,
    description_link,
    description_retrieval_date,
    website,
    in_sandp_500,
    in_fortune_global_500,
    COALESCE(legacy_cset_id, 4000+new_cset_id))