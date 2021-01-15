-- Pulling every AI-associated original patent family id linked to every grid id of any assignee for that patent
-- We want this because when we count AI patents later on, our count will be "for each grid id, how
-- many patent family IDs exist?" That is, we'll count patent families multiple times if they have multiple assignees.
-- Creating this table makes that easy! We are using family ids instead of ids to avoid overcounting patents that were filed
-- multiple times or have multiple records (applied/granted, say) or were filed in multiple locations.
create or replace table ai_companies_visualization.grid_ai_patents_original_assignee as
SELECT
-- Adding in the org name and country associated with the grid id
  ai_pats.*,
  org_name,
  country
FROM (
  SELECT
  -- Distincting on the merged family id and the grid id so each patent is only listed with each assignee once
  -- but is listed multiple times if it has multiple distinct assignees
    DISTINCT Simple_family_id,
    original_grid_id
  FROM ((
  -- Selecting all the family ids and patent IDs and grid ids from 1790 to get AI patents
    SELECT
      Simple_family_id, CONCAT(Publication_country, "-", Publication_number, "-", Publication_type) as patent_id
    FROM
      gcp-cset-projects.1790_patents.1790_ai_patents_all_quantitative_information) as all_ai
      LEFT JOIN
      (SELECT
      -- Joining in the original assignee grid ids from dimensions
      id, original.grid_id as original_grid_id FROM

        `gcp-cset-projects.gcp_cset_digital_science.dimensions_patents_latest`, UNNEST(original_assignee) as original) as patents_orig
        ON all_ai.patent_id = patents_orig.id
      )
  GROUP BY
    original_grid_id,
    Simple_family_id) ai_pats
LEFT JOIN (
-- Adding in org names and country data using GRID
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid) gr
ON
  ai_pats.original_grid_id = gr.id
  WHERE original_grid_id IS NOT NULL and original_grid_id != ""