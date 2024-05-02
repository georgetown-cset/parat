-- Pulling every patent family id linked to every ror id of any assignee for that patent, and all the assignee names
-- We also attempt to add in "fake" families for the patents that are missing patent families
with patents_orig as (
  SELECT
    -- Pulling in the current assignee ror ids
    patent_id,
    family_id,
    assignee,
    ror_id
  FROM
    unified_patents.assignees_normalized
),
patent_years as (
  SELECT
    patent_id,
    EXTRACT(year FROM first_priority_date) as priority_year
  FROM
    unified_patents.dates
),
unnested_rors AS (
  SELECT
    CSET_id,
    r as ror_id
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN UNNEST(ror_id) as r
),
linked_patents as (
  SELECT
    DISTINCT
    -- If the family id is null we can't group by family id so we create a fake family id using the patent id
    -- Since we can't group by family id there should only be one patent id in these cases
    -- We're just doing this so our counts aren't blank
    COALESCE(family_id, "X-" || patent_id) as family_id,
    assignee,
    ror_id,
    MIN(priority_year) as year,
  FROM ( patents_orig
      LEFT JOIN patent_years
        USING (patent_id))
  WHERE priority_year IS NOT NULL
  GROUP BY
    ror_id,
    assignee,
    family_id
)

SELECT DISTINCT
  CSET_id,
  family_id,
  year
FROM
  unnested_rors
INNER JOIN
  linked_patents
USING (ror_id)
UNION DISTINCT
SELECT
  CSET_id,
  family_id,
  year
FROM
  staging_ai_companies_visualization.org_name_matches
INNER JOIN
  linked_patents
ON org_name = assignee