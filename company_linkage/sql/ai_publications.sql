WITH
  ai_papers AS (
  SELECT
    merged_id,
    cv_filtered,
    nlp_filtered,
    robotics_filtered
  FROM
    gcp-cset-projects.article_classification.predictions
  WHERE
    ai_filtered = TRUE OR cv_filtered = TRUE OR nlp_filtered = TRUE OR robotics_filtered = TRUE),
  ror AS (
    -- Adding in org names and country data using ROR
  SELECT
    id,
    ror.name AS org_name,
    standard_name AS country
  FROM
    gcp_cset_ror.ror
    LEFT JOIN
    countries.country_code
    ON lower(country.country_code) = lower(country_code.raw_alpha_2)),
  merged_rors AS (
    -- Selecting all the merged ids and ror ids from the literature table
  SELECT
    DISTINCT
    merged_id,
    ror_id,
    org_name,
    cv_filtered as cv,
    nlp_filtered as nlp,
    robotics_filtered as robotics
  FROM
    literature.affiliations
    -- if they're AI papers
  INNER JOIN ai_papers
    USING (merged_id)),
  article_years AS (
  SELECT
    merged_id,
    year
  FROM
    literature.papers)
SELECT
  -- Adding in the org name and country associated with the ror id
  merged_rors.* EXCEPT (org_name),
  COALESCE(ror.org_name, merged_rors.org_name) as org_name,
  country,
  year
FROM
  merged_rors
LEFT JOIN
  ror
ON
  merged_rors.ror_id = ror.id
LEFT JOIN
  article_years
ON
  merged_rors.merged_id = article_years.merged_id