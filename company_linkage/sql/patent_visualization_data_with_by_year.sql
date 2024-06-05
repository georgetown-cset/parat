WITH
  aipats AS (
    -- Pulling all the patents from any of our companies
  SELECT
    *
  FROM
    staging_ai_companies_visualization.ai_company_patents),
  pattable AS (
    -- Getting the count of patents
  SELECT
    CSET_id,
    priority_year,
    COUNT(DISTINCT family_id) AS ai_patents,
    COUNT(DISTINCT CASE WHEN Physical_Sciences_and_Engineering IS TRUE THEN family_id END) as Physical_Sciences_and_Engineering_pats,
    COUNT(DISTINCT CASE WHEN Life_Sciences IS TRUE THEN family_id END) as Life_Sciences_pats,
    COUNT(DISTINCT CASE WHEN Security__eg_cybersecurity IS TRUE THEN family_id END) as Security__eg_cybersecurity_pats,
    COUNT(DISTINCT CASE WHEN Transportation IS TRUE THEN family_id END) as Transportation_pats,
    COUNT(DISTINCT CASE WHEN Industrial_and_Manufacturing IS TRUE THEN family_id END) as Industrial_and_Manufacturing_pats,
    COUNT(DISTINCT CASE WHEN Education IS TRUE THEN family_id END) as Education_pats,
    COUNT(DISTINCT CASE WHEN Document_Mgt_and_Publishing IS TRUE THEN family_id END) as Document_Mgt_and_Publishing_pats,
    COUNT(DISTINCT CASE WHEN Military IS TRUE THEN family_id END) as Military_pats,
    COUNT(DISTINCT CASE WHEN Agricultural IS TRUE THEN family_id END) as Agricultural_pats,
    COUNT(DISTINCT CASE WHEN Computing_in_Government IS TRUE THEN family_id END) as Computing_in_Government_pats,
    COUNT(DISTINCT CASE WHEN Personal_Devices_and_Computing IS TRUE THEN family_id END) as Personal_Devices_and_Computing_pats,
    COUNT(DISTINCT CASE WHEN Banking_and_Finance IS TRUE THEN family_id END) as Banking_and_Finance_pats,
    COUNT(DISTINCT CASE WHEN Telecommunications IS TRUE THEN family_id END) as Telecommunications_pats,
    COUNT(DISTINCT CASE WHEN Networks__eg_social_IOT_etc IS TRUE THEN family_id END) as Networks__eg_social_IOT_etc_pats,
    COUNT(DISTINCT CASE WHEN Business IS TRUE THEN family_id END) as Business_pats,
    COUNT(DISTINCT CASE WHEN Energy_Management IS TRUE THEN family_id END) as Energy_Management_pats,
    COUNT(DISTINCT CASE WHEN Entertainment IS TRUE THEN family_id END) as Entertainment_pats,
    COUNT(DISTINCT CASE WHEN Nanotechnology IS TRUE THEN family_id END) as Nanotechnology_pats,
    COUNT(DISTINCT CASE WHEN Semiconductors IS TRUE THEN family_id END) as Semiconductors_pats,
    COUNT(DISTINCT CASE WHEN Language_Processing IS TRUE THEN family_id END) as Language_Processing_pats,
    COUNT(DISTINCT CASE WHEN Speech_Processing IS TRUE THEN family_id END) as Speech_Processing_pats,
    COUNT(DISTINCT CASE WHEN Knowledge_Representation IS TRUE THEN family_id END) as Knowledge_Representation_pats,
    COUNT(DISTINCT CASE WHEN Planning_and_Scheduling IS TRUE THEN family_id END) as Planning_and_Scheduling_pats,
    COUNT(DISTINCT CASE WHEN Control IS TRUE THEN family_id END) as Control_pats,
    COUNT(DISTINCT CASE WHEN Distributed_AI IS TRUE THEN family_id END) as Distributed_AI_pats,
    COUNT(DISTINCT CASE WHEN Robotics IS TRUE THEN family_id END) as Robotics_pats,
    COUNT(DISTINCT CASE WHEN Computer_Vision IS TRUE THEN family_id END) as Computer_Vision_pats,
    COUNT(DISTINCT CASE WHEN Analytics_and_Algorithms IS TRUE THEN family_id END) as Analytics_and_Algorithms_pats,
    COUNT(DISTINCT CASE WHEN Measuring_and_Testing IS TRUE THEN family_id END) as Measuring_and_Testing_pats,
    COUNT(DISTINCT CASE WHEN Logic_Programming IS TRUE THEN family_id END) as Logic_Programming_pats,
    COUNT(DISTINCT CASE WHEN Fuzzy_Logic IS TRUE THEN family_id END) as Fuzzy_Logic_pats,
    COUNT(DISTINCT CASE WHEN Probabilistic_Reasoning IS TRUE THEN family_id END) as Probabilistic_Reasoning_pats,
    COUNT(DISTINCT CASE WHEN Ontology_Engineering IS TRUE THEN family_id END) as Ontology_Engineering_pats,
    COUNT(DISTINCT CASE WHEN Machine_Learning IS TRUE THEN family_id END) as Machine_Learning_pats,
    COUNT(DISTINCT CASE WHEN Search_Methods IS TRUE THEN family_id END) as Search_Methods_pats
  FROM aipats
  GROUP BY
    CSET_id,
    priority_year),
  by_year as (
    -- Get the counts by year
  SELECT
    CSET_id,
    ARRAY_AGG(STRUCT(priority_year,
        ai_patents as num_patents)
    ORDER BY
      priority_year) AS ai_patents_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Physical_Sciences_and_Engineering_pats as num_patents)
    ORDER BY
      priority_year) AS Physical_Sciences_and_Engineering_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Life_Sciences_pats as num_patents)
    ORDER BY
      priority_year) AS Life_Sciences_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Security__eg_cybersecurity_pats as num_patents)
    ORDER BY
      priority_year) AS Security__eg_cybersecurity_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Transportation_pats as num_patents)
    ORDER BY
      priority_year) AS Transportation_pats_by_year,
      ARRAY_AGG(STRUCT(priority_year,
        Industrial_and_Manufacturing_pats as num_patents)
    ORDER BY
      priority_year) AS Industrial_and_Manufacturing_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Education_pats as num_patents)
    ORDER BY
      priority_year) AS Education_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Document_Mgt_and_Publishing_pats as num_patents)
    ORDER BY
      priority_year) AS Document_Mgt_and_Publishing_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Military_pats as num_patents)
    ORDER BY
      priority_year) AS Military_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Agricultural_pats as num_patents)
    ORDER BY
      priority_year) AS Agricultural_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Computing_in_Government_pats as num_patents)
    ORDER BY
      priority_year) AS Computing_in_Government_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Personal_Devices_and_Computing_pats as num_patents)
    ORDER BY
      priority_year) AS Personal_Devices_and_Computing_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Banking_and_Finance_pats as num_patents)
    ORDER BY
      priority_year) AS Banking_and_Finance_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Telecommunications_pats as num_patents)
    ORDER BY
      priority_year) AS Telecommunications_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Networks__eg_social_IOT_etc_pats as num_patents)
    ORDER BY
      priority_year) AS Networks__eg_social_IOT_etc_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Business_pats as num_patents)
    ORDER BY
      priority_year) AS Business_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Energy_Management_pats as num_patents)
    ORDER BY
      priority_year) AS Energy_Management_pats_by_year,
      ARRAY_AGG(STRUCT(priority_year,
        Entertainment_pats as num_patents)
    ORDER BY
      priority_year) AS Entertainment_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Nanotechnology_pats as num_patents)
    ORDER BY
      priority_year) AS Nanotechnology_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Semiconductors_pats as num_patents)
    ORDER BY
      priority_year) AS Semiconductors_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Language_Processing_pats as num_patents)
    ORDER BY
      priority_year) AS Language_Processing_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Speech_Processing_pats as num_patents)
    ORDER BY
      priority_year) AS Speech_Processing_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Knowledge_Representation_pats as num_patents)
    ORDER BY
      priority_year) AS Knowledge_Representation_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Planning_and_Scheduling_pats as num_patents)
    ORDER BY
      priority_year) AS Planning_and_Scheduling_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Control_pats as num_patents)
    ORDER BY
      priority_year) AS Control_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Distributed_AI_pats as num_patents)
    ORDER BY
      priority_year) AS Distributed_AI_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Robotics_pats as num_patents)
    ORDER BY
      priority_year) AS Robotics_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Computer_Vision_pats as num_patents)
    ORDER BY
      priority_year) AS Computer_Vision_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Analytics_and_Algorithms_pats as num_patents)
    ORDER BY
      priority_year) AS Analytics_and_Algorithms_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Measuring_and_Testing_pats as num_patents)
    ORDER BY
      priority_year) AS Measuring_and_Testing_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Logic_Programming_pats as num_patents)
    ORDER BY
      priority_year) AS Logic_Programming_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Fuzzy_Logic_pats as num_patents)
    ORDER BY
      priority_year) AS Fuzzy_Logic_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Probabilistic_Reasoning_pats as num_patents)
    ORDER BY
      priority_year) AS Probabilistic_Reasoning_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Ontology_Engineering_pats as num_patents)
    ORDER BY
      priority_year) AS Ontology_Engineering_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Machine_Learning_pats as num_patents)
    ORDER BY
      priority_year) AS Machine_Learning_pats_by_year,
    ARRAY_AGG(STRUCT(priority_year,
        Search_Methods_pats as num_patents)
    ORDER BY
      priority_year) AS Search_Methods_pats_by_year,
  FROM
    high_resolution_entities.aggregated_organizations
  LEFT JOIN
    pattable
  USING
    (CSET_id)
  GROUP BY
    CSET_id
)
  -- Pulling CSET_id and name, plus ai_pats
SELECT
  viz.*,
  by_year.* EXCEPT (CSET_id)
FROM
  staging_ai_companies_visualization.initial_patent_visualization_data AS viz
LEFT JOIN
  by_year
USING
  (CSET_id)