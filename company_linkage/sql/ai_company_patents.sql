WITH unnested_rors AS (
  SELECT
    CSET_id,
    r as ror_id
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN UNNEST(ror_id) as r
)

SELECT
  CSET_id,
  family_id,
  priority_year,
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
  Control,
  Distributed_AI,
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
  unnested_rors
INNER JOIN
  staging_ai_companies_visualization.linked_ai_patents
USING (ror_id)
UNION DISTINCT
SELECT
  CSET_id,
  family_id,
  priority_year,
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
  Control,
  Distributed_AI,
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
  staging_ai_companies_visualization.org_name_matches
INNER JOIN
  staging_ai_companies_visualization.linked_ai_patents
ON assignee = org_name