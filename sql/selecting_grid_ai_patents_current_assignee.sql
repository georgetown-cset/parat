-- Pulling every AI-associated current patent family id linked to every grid id of any assignee for that patent
-- We want this because when we count AI patents later on, our count will be "for each grid id, how
-- many patent family IDs exist?" That is, we'll count patent families multiple times if they have multiple assignees.
-- Creating this table makes that easy! We are using family ids instead of ids to avoid overcounting patents that were filed
-- multiple times or have multiple records (applied/granted, say) or were filed in multiple locations.
create or replace table ai_companies_visualization.grid_ai_patents_current_assignee as
with patents_orig as (
SELECT
  -- Pulling in the current assignee grid ids from dimensions
  id,
  curr.grid_id AS current_grid_id
FROM
  `gcp-cset-projects.gcp_cset_digital_science.dimensions_patents_latest`,
  UNNEST(current_assignee) AS curr),
all_ai as (
  -- Selecting all the family ids and patent IDs from 1790 to get AI patents
  -- Also select the year so we can get counts by year
    SELECT
      Simple_family_id,
      CONCAT(Publication_country, "-", Publication_number, "-", Publication_type) as patent_id,
      EXTRACT(year from first_priority_date) as priority_year
    FROM
      gcp-cset-projects.1790_patents.1790_ai_patents_all_quantitative_information),
ai_pats as (
  SELECT
  -- Distincting on the merged family id and the grid id so each patent is only listed with each assignee once
  -- but is listed multiple times if it has multiple distinct assignees
    DISTINCT Simple_family_id,
    current_grid_id,
    priority_year
    -- Only including patents if their ids are in 1790, ensuring we have AI patents
  FROM ( all_ai
      LEFT JOIN patents_orig
        ON
          all_ai.patent_id = patents_orig.id )
  GROUP BY
    current_grid_id,
    Simple_family_id,
    priority_year),
gr as (
-- Adding in org names and country data using GRID
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid)
SELECT
-- Adding in the org name and country associated with the grid id
  ai_pats.*,
  org_name,
  country
FROM ai_pats
LEFT JOIN gr
ON
  ai_pats.current_grid_id = gr.id
  WHERE current_grid_id IS NOT NULL and current_grid_id != ""