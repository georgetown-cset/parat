-- Pulling every AI-associated patent family id which has an assignee that isn't linked to a grid id for that patent
-- We want this because when we count AI patents later on, our count will be "for each grid id, how
-- many patent family IDs exist?" but will be supplemented by "for each regex, how many patent family IDs exist?"
-- That is, we'll count patent families multiple times (for multiple organizations) if they have multiple assignees.
-- Creating this table makes that easy! We are using family ids instead of ids to avoid overcounting patents that were filed
-- multiple times or have multiple records (applied/granted, say) or were filed in multiple locations.
-- We also pull in the AI subcategories
create or replace table ai_companies_visualization.no_grid_ai_patents as
with patents_orig as (
SELECT
  -- Pulling in the current assignee grid ids from dimensions
  patent_id,
  family_id,
  grid,
  assignee
FROM
  `gcp-cset-projects.unified_patents.normalized_patent_assignees`),
all_ai as (
  -- Selecting all the family ids and patent IDs from 1790 to get AI patents
  -- Also select the year so we can get counts by year
    SELECT
      patent_id,
      Physical_Sciences_and_Engineering,
      Life_Sciences,
      Security__eg_cybersecurity,
      Transportation,
      Industrial_and_Manufacturing,
      Education,
      Document_Mgt_and_Publishing,
      Military,
      Agricultural,
      Computing_in_Government,
      Personal_Devices_and_Computing,
      Banking_and_Finance,
      Telecommunications,
      Networks__eg_social_IOT_etc,
      Business,
      Energy_Management,
      Entertainment,
      Nanotechnology,
      Semiconductors,
      Language_Processing,
      Speech_Processing,
      Knowledge_Representation,
      Planning_and_Scheduling,
      Control, Distributed_AI,
      Robotics,
      Computer_Vision,
      Analytics_and_Algorithms,
      Measuring_and_Testing,
      Logic_Programming,
      Fuzzy_Logic,
      Probabilistic_Reasoning,
      Ontology_Engineering,
      Machine_Learning,
      Search_Methods
    FROM
      gcp-cset-projects.unified_patents.ai_patents),
  patent_years as (
  SELECT
      patent_id,
      EXTRACT(year FROM first_priority_date) as priority_year
    FROM
      gcp-cset-projects.unified_patents.patent_dates
  ),
ai_pats as (
  SELECT
  -- Distincting on the merged family id and the grid id so each patent is only listed with each assignee once
  -- but is listed multiple times if it has multiple distinct assignees
    DISTINCT
    -- If the family id is null we can't group by family id so we create a fake family id using the patent id
    -- Since we can't group by family id there should only be one patent id in these cases
    -- We're just doing this so our counts aren't blank
    COALESCE(family_id, "X-" || patent_id) as family_id,
    grid,
    assignee,
    MIN(priority_year) as priority_year,
    LOGICAL_OR(Physical_Sciences_and_Engineering) as Physical_Sciences_and_Engineering,
    LOGICAL_OR(Life_Sciences) as Life_Sciences,
    LOGICAL_OR(Security__eg_cybersecurity) as Security__eg_cybersecurity,
    LOGICAL_OR(Transportation) as Transportation,
    LOGICAL_OR(Industrial_and_Manufacturing) as Industrial_and_Manufacturing,
    LOGICAL_OR(Education) as Education,
    LOGICAL_OR(Document_Mgt_and_Publishing) as Document_Mgt_and_Publishing,
    LOGICAL_OR(Military) as Military,
    LOGICAL_OR(Agricultural) as Agricultural,
    LOGICAL_OR(Computing_in_Government) as Computing_in_Government,
    LOGICAL_OR(Personal_Devices_and_Computing) as Personal_Devices_and_Computing,
    LOGICAL_OR(Banking_and_Finance) as Banking_and_Finance,
    LOGICAL_OR(Telecommunications) as Telecommunications,
    LOGICAL_OR(Networks__eg_social_IOT_etc) as Networks__eg_social_IOT_etc,
    LOGICAL_OR(Business) as Business,
    LOGICAL_OR(Energy_Management) as Energy_Management,
    LOGICAL_OR(Entertainment) as Entertainment,
    LOGICAL_OR(Nanotechnology) as Nanotechnology,
    LOGICAL_OR(Semiconductors) as Semiconductors,
    LOGICAL_OR(Language_Processing) as Language_Processing,
    LOGICAL_OR(Speech_Processing) as Speech_Processing,
    LOGICAL_OR(Knowledge_Representation) as Knowledge_Representation,
    LOGICAL_OR(Planning_and_Scheduling) as Planning_and_Scheduling,
    LOGICAL_OR(Control) as Control,
    LOGICAL_OR(Distributed_AI) as Distributed_AI,
    LOGICAL_OR(Robotics) as Robotics,
    LOGICAL_OR(Computer_Vision) as Computer_Vision,
    LOGICAL_OR(Analytics_and_Algorithms) as Analytics_and_Algorithms,
    LOGICAL_OR(Measuring_and_Testing) as Measuring_and_Testing,
    LOGICAL_OR(Logic_Programming) as Logic_Programming,
    LOGICAL_OR(Fuzzy_Logic) as Fuzzy_Logic,
    LOGICAL_OR(Probabilistic_Reasoning) as Probabilistic_Reasoning,
    LOGICAL_OR(Ontology_Engineering) as Ontology_Engineering,
    LOGICAL_OR(Machine_Learning) as Machine_Learning,
    LOGICAL_OR(Search_Methods) as Search_Methods
    -- Only including patents if their ids are in 1790, ensuring we have AI patents
  FROM ( all_ai
      LEFT JOIN patents_orig
        USING (patent_id)
      LEFT JOIN patent_years
        USING (patent_id))
  GROUP BY
    grid,
    assignee,
    family_id)
SELECT
-- Adding in the org name and country associated with the grid id
* EXCEPT(grid)
FROM ai_pats
  WHERE grid IS NULL OR grid = ""