WITH
  allpats AS (
    -- Pulling all the patents from any of our companies
  SELECT
    *
  FROM
    staging_ai_companies_visualization.all_patent_counts),
  pattable AS (
    -- Getting the count of patents
  SELECT
    CSET_id,
    priority_year,
    COUNT(DISTINCT family_id) AS all_patents,
  FROM allpats
  GROUP BY
    CSET_id,
    priority_year),
  by_year as (
    -- Get the counts by year
  SELECT
    CSET_id,
    all_patents,
    ARRAY_AGG(STRUCT(priority_year,
        all_patents)
    ORDER BY
      priority_year) AS all_patents_by_year,
  FROM
    high_resolution_entities.aggregated_organizations
  LEFT JOIN
    pattable
  USING
    (CSET_id)
  GROUP BY
    CSET_id,
    all_patents
)
  -- Pulling CSET_id and name, plus all patents
SELECT
  viz.*,
  by_year.* EXCEPT (CSET_id)
FROM
  staging_ai_companies_visualization.patent_visualization_data_with_grants_by_year AS viz
LEFT JOIN
  by_year
USING
  (CSET_id)