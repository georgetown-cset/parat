CREATE OR REPLACE TABLE
  ai_companies_visualization.pubs_in_top_conferences AS
WITH
  -- Associating GRIDs to the merged paper ids
  affils AS (
  SELECT
    merged_id,
    org_name,
    ror_id
  FROM
    literature.affiliations
    WHERE org_name IS NOT NULL OR ror_id IS NOT NULL),
  -- Associating ROR organizational information to the RORs, for consistent naming and locational information
  ror_data AS (
  SELECT
    id,
    ror.name AS org_name,
    standard_name as country
  FROM
    gcp_cset_ror.ror
    LEFT JOIN
    countries.country_code
    ON lower(country.country_code) = lower(country_code.raw_alpha_2))
  -- For every paper that was published at a top AI conference, we want its paper id, its ror, and its ror-based org name
SELECT
  DISTINCT
  top_pubs.merged_id,
  COALESCE(ror_data.org_name, affils.org_name) as org_name,
  ror_id,
  year
FROM
  ai_companies_visualization.top_conference_pubs AS top_pubs
  -- We're inner joining because if there's no affiliate information at all we have no way to even evaluate this data for our purposes
INNER JOIN
  affils
ON
  top_pubs.merged_id = affils.merged_id
LEFT JOIN
  ror_data
ON
  affils.ror_ID = ror_data.id
GROUP BY
  ror_id,
  org_name,
  top_pubs.merged_id,
  year