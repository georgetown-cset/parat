  -- We're adding useful Crunchbase data to the visualization: descriptions, logos, and the company's "stage"
  -- (which we're using as a proxy for its size/growth but is actually based on what funding it has received).
WITH
  -- Pull in all the visualization data, most importantly including the crunchbase uuid that will be used to connect to everything else
  visualization AS (
  SELECT
    *
  FROM
    staging_ai_companies_visualization.visualization_data_omit_by_rule),
  -- Grab the descriptions and logos from Crunchbase ODM
  odm_data AS (
  SELECT
    uuid,
    short_description,
    logo_url
  FROM
    gcp_cset_crunchbase.organizations_odm),
  -- Grab the raw stage data for companies
  -- Since companies have multiple funding rounds they may have multiple rows!
  -- We need to deal with this
  stage_data AS (
  SELECT
    -- We use the org_uuid to find the funding rounds associated with our org, rather than the uuid which is associated with funding
    org_uuid,
    CASE
    -- 0 here equals startup. We use numbers because we want to be able to use GROUP BY and select the MAX
      WHEN investment_type = "seed" THEN 0
      WHEN investment_type = "grant" THEN 0
      WHEN investment_type = "pre_seed" THEN 0
      WHEN investment_type = "angel" THEN 0
    -- 1 here equals Growth
      WHEN investment_type = "series_a" THEN 1
      WHEN investment_type = "series_b" THEN 1
    -- 2 here equals Mature
      WHEN investment_type = "series_d" THEN 2
      WHEN investment_type = "series_c" THEN 1
      WHEN investment_type = "series_h" THEN 2
      WHEN investment_type = "series_e" THEN 2
      WHEN investment_type = "post_ipo_equity" THEN 2
      WHEN investment_type = "post_ipo_debt" THEN 2
      WHEN investment_type = "post_ipo_secondary" THEN 2
      WHEN investment_type = "series_i" THEN 2
      WHEN investment_type = "series_f" THEN 2
      WHEN investment_type = "series_g" THEN 2
      WHEN investment_type = "series_j" THEN 2
    ELSE
    -- -1 means the type is Unknown
    -1
  END
    AS stage
  FROM
    gcp_cset_crunchbase.funding_rounds),
  -- Now we want only one stage value to come out for any given company
  -- If a company has ever been mature, it's no longer growth or startup, etc.
  -- So there's a clear hierarchy, and we take the max
  combine_stages AS (
  SELECT
    org_uuid,
    MAX(stage) AS stage_num
  FROM
    stage_data
  GROUP BY
    org_uuid ),
  -- Now we convert numbers to stage names!
  add_employees AS (
  SELECT
    org_uuid,
    CASE
      WHEN employee_count = "10000+" THEN 2
      WHEN employee_count = "5001-10000" THEN 2
      WHEN employee_count = "1001-5000" THEN 2
    ELSE
    stage_num
  END
    AS stage_num
  FROM
    combine_stages
  LEFT JOIN
    gcp_cset_crunchbase.organizations
  ON
    combine_stages.org_uuid = organizations.uuid ),
  stage_name AS (
  SELECT
    org_uuid,
    CASE
      WHEN stage_num = 2 THEN "Mature"
      WHEN stage_num = 1 THEN "Growth"
      WHEN stage_num = 0 THEN "Startup"
    ELSE
    NULL
  END
    AS stage
  FROM
    add_employees )
  -- Put all of our data together and add it to the visualization table
SELECT
  visualization.*,
  short_description,
  logo_url,
  CASE
    WHEN ARRAY_LENGTH(market) > 0 THEN "Mature"
    WHEN stage IS NOT NULL THEN stage
  ELSE
  NULL
END
  AS stage
FROM
  visualization
LEFT JOIN
  odm_data
ON
  TRIM(visualization.crunchbase.crunchbase_uuid) = TRIM(odm_data.uuid)
LEFT JOIN
  stage_name
ON
  visualization.crunchbase.crunchbase_uuid = stage_name.org_uuid