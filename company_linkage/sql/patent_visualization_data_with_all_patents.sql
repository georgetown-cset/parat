WITH
  allpats AS (
    -- Pulling all the patents from any of our companies
  SELECT
    *
  FROM
    staging_ai_companies_visualization.linked_all_patents),
  pattable AS (
    -- Getting the count of patents
  SELECT
    CSET_id,
    year,
    COUNT(DISTINCT family_id) AS all_patents,
  FROM allpats
  GROUP BY
    CSET_id,
    year),
  aggregated as (
    SELECT
      CSET_id,
      COUNT(DISTINCT family_id) AS all_patents,
    FROM allpats
    GROUP BY
      CSET_id
  ),
  by_year as (
    -- Get the counts by year
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(year,
        all_patents)
    ORDER BY
      year) AS all_patents_by_year,
  FROM
    high_resolution_entities.aggregated_organizations
  LEFT JOIN
    pattable
  USING
    (CSET_id)
  GROUP BY
    CSET_id
)
  -- Pulling CSET_id and name, plus all patents
SELECT
  viz.*,
  all_patents,
  by_year.* EXCEPT (CSET_id)
FROM
  staging_ai_companies_visualization.patent_visualization_data_with_grants_by_year AS viz
LEFT JOIN
  aggregated
USING
  (CSET_id)
LEFT JOIN
  by_year
USING
  (CSET_id)
