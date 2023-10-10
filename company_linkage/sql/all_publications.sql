  -- Pulling every publication id linked to every author affiliate and all years because we'll want those later for yearly count
WITH
  ror AS (
    -- Adding in org names and country data using ROR
  SELECT
    id,
    ror.name AS org_name,
    standard_name as country
  FROM
    gcp_cset_ror.ror
    LEFT JOIN
    countries.country_code
    ON lower(country.country_code) = lower(country_code.raw_alpha_2)),
  arts AS (
    -- Selecting all the merged ids and affiliations from the links table
  SELECT
    DISTINCT
    merged_id,
    org_name,
    ror_id,
    country
  FROM
    literature.affiliations
    WHERE org_name IS NOT NULL OR ror_id IS NOT NULL),
  article_years AS (
  SELECT
    merged_id,
    year
  FROM
    literature.papers)
SELECT
  -- Adding in the org name and country associated with the grid id
  arts.* EXCEPT (org_name, country),
  COALESCE(ror.org_name, arts.org_name) as org_name,
  COALESCE(ror.country, arts.country) as country,
  year
FROM
  arts
LEFT JOIN
  ror
ON
  arts.ror_id = ror.id
LEFT JOIN
  article_years
ON
  arts.merged_id = article_years.merged_id