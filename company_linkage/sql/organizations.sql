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
    CSET_id,
    organizations_joined.name,
    STRUCT(city,
      province_state,
      organizations_joined.country) AS location,
    website,
    ARRAY_AGG(STRUCT(alias_language,
        alias)) AS aliases,
    ARRAY_AGG(STRUCT(CASE
          WHEN parent_acquisition IS TRUE THEN TRUE
        ELSE
        FALSE
      END
        AS parent_acquisition,
        parent_name,
        parent_id)) AS parent,
    ARRAY_AGG(DISTINCT permid IGNORE NULLS) AS permid,
    ARRAY_AGG(STRUCT(exchange,
        ticker)) AS market,
    STRUCT(crunchbase_uuid,
      crunchbase_url) AS crunchbase,
    ARRAY_AGG(DISTINCT ror.id IGNORE NULLS) AS ror_id,
    regex,
    ARRAY_AGG(DISTINCT bgov_id IGNORE NULLS) AS BGOV_id,
    linkedin,
    CASE
      WHEN in_sandp_500 IS TRUE THEN TRUE
    ELSE
    FALSE
  END
    AS in_sandp_500,
    CASE
      WHEN in_fortune_global_500 IS TRUE THEN TRUE
    ELSE
    FALSE
  END
    AS in_fortune_global_500,
    ids_joined.comment
  FROM
    parat_input.organizations_joined
  LEFT JOIN
    parat_input.alias_joined
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.parent_joined
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.permid_joined
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.market_joined
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.ids_joined
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.grid_joined
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.bgov_validate
  USING
    (CSET_id)
  LEFT JOIN
    parat_input.linkedin_joined
  USING
    (CSET_id)
  LEFT JOIN
    gcp_cset_ror.ror
  ON
    TRIM(grid_joined.grid) = external_ids.GRID.all
  GROUP BY
    CSET_id,
    name,
    city,
    province_state,
    organizations_joined.country,
    website,
    crunchbase_uuid,
    crunchbase_url,
    regex,
    linkedin,
    in_sandp_500,
    in_fortune_global_500,
    comment)