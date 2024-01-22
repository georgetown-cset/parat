WITH
  aipats AS (
    -- Pulling all the patents from any of our companies
  SELECT
    *
  FROM
    staging_ai_companies_visualization.ai_company_patent_grants),
  pattable AS (
    -- Getting the count of patents
  SELECT
    CSET_id,
    COUNT(DISTINCT family_id) AS ai_patents_grants,
    COUNT(DISTINCT CASE WHEN Physical_Sciences_and_Engineering IS TRUE THEN family_id END) as Physical_Sciences_and_Engineering_pats_grants,
    COUNT(DISTINCT CASE WHEN Life_Sciences IS TRUE THEN family_id END) as Life_Sciences_pats_grants,
    COUNT(DISTINCT CASE WHEN Security__eg_cybersecurity IS TRUE THEN family_id END) as Security__eg_cybersecurity_pats_grants,
    COUNT(DISTINCT CASE WHEN Transportation IS TRUE THEN family_id END) as Transportation_pats_grants,
    COUNT(DISTINCT CASE WHEN Industrial_and_Manufacturing IS TRUE THEN family_id END) as Industrial_and_Manufacturing_pats_grants,
    COUNT(DISTINCT CASE WHEN Education IS TRUE THEN family_id END) as Education_pats_grants,
    COUNT(DISTINCT CASE WHEN Document_Mgt_and_Publishing IS TRUE THEN family_id END) as Document_Mgt_and_Publishing_pats_grants,
    COUNT(DISTINCT CASE WHEN Military IS TRUE THEN family_id END) as Military_pats_grants,
    COUNT(DISTINCT CASE WHEN Agricultural IS TRUE THEN family_id END) as Agricultural_pats_grants,
    COUNT(DISTINCT CASE WHEN Computing_in_Government IS TRUE THEN family_id END) as Computing_in_Government_pats_grants,
    COUNT(DISTINCT CASE WHEN Personal_Devices_and_Computing IS TRUE THEN family_id END) as Personal_Devices_and_Computing_pats_grants,
    COUNT(DISTINCT CASE WHEN Banking_and_Finance IS TRUE THEN family_id END) as Banking_and_Finance_pats_grants,
    COUNT(DISTINCT CASE WHEN Telecommunications IS TRUE THEN family_id END) as Telecommunications_pats_grants,
    COUNT(DISTINCT CASE WHEN Networks__eg_social_IOT_etc IS TRUE THEN family_id END) as Networks__eg_social_IOT_etc_pats_grants,
    COUNT(DISTINCT CASE WHEN Business IS TRUE THEN family_id END) as Business_pats_grants,
    COUNT(DISTINCT CASE WHEN Energy_Management IS TRUE THEN family_id END) as Energy_Management_pats_grants,
    COUNT(DISTINCT CASE WHEN Entertainment IS TRUE THEN family_id END) as Entertainment_pats_grants,
    COUNT(DISTINCT CASE WHEN Nanotechnology IS TRUE THEN family_id END) as Nanotechnology_pats_grants,
    COUNT(DISTINCT CASE WHEN Semiconductors IS TRUE THEN family_id END) as Semiconductors_pats_grants,
    COUNT(DISTINCT CASE WHEN Language_Processing IS TRUE THEN family_id END) as Language_Processing_pats_grants,
    COUNT(DISTINCT CASE WHEN Speech_Processing IS TRUE THEN family_id END) as Speech_Processing_pats_grants,
    COUNT(DISTINCT CASE WHEN Knowledge_Representation IS TRUE THEN family_id END) as Knowledge_Representation_pats_grants,
    COUNT(DISTINCT CASE WHEN Planning_and_Scheduling IS TRUE THEN family_id END) as Planning_and_Scheduling_pats_grants,
    COUNT(DISTINCT CASE WHEN Control IS TRUE THEN family_id END) as Control_pats_grants,
    COUNT(DISTINCT CASE WHEN Distributed_AI IS TRUE THEN family_id END) as Distributed_AI_pats_grants,
    COUNT(DISTINCT CASE WHEN Robotics IS TRUE THEN family_id END) as Robotics_pats_grants,
    COUNT(DISTINCT CASE WHEN Computer_Vision IS TRUE THEN family_id END) as Computer_Vision_pats_grants,
    COUNT(DISTINCT CASE WHEN Analytics_and_Algorithms IS TRUE THEN family_id END) as Analytics_and_Algorithms_pats_grants,
    COUNT(DISTINCT CASE WHEN Measuring_and_Testing IS TRUE THEN family_id END) as Measuring_and_Testing_pats_grants,
    COUNT(DISTINCT CASE WHEN Logic_Programming IS TRUE THEN family_id END) as Logic_Programming_pats_grants,
    COUNT(DISTINCT CASE WHEN Fuzzy_Logic IS TRUE THEN family_id END) as Fuzzy_Logic_pats_grants,
    COUNT(DISTINCT CASE WHEN Probabilistic_Reasoning IS TRUE THEN family_id END) as Probabilistic_Reasoning_pats_grants,
    COUNT(DISTINCT CASE WHEN Ontology_Engineering IS TRUE THEN family_id END) as Ontology_Engineering_pats_grants,
    COUNT(DISTINCT CASE WHEN Machine_Learning IS TRUE THEN family_id END) as Machine_Learning_pats_grants,
    COUNT(DISTINCT CASE WHEN Search_Methods IS TRUE THEN family_id END) as Search_Methods_pats_grants

  FROM aipats
  GROUP BY
    CSET_id),
grants_all as
  -- Pulling CSET_id and name, plus ai_pats
(SELECT
  CSET_id,
  COALESCE(ai_patents_grants, 0) as ai_patents_grants,
  COALESCE(Physical_Sciences_and_Engineering_pats_grants, 0) as Physical_Sciences_and_Engineering_pats_grants,
  COALESCE(Life_Sciences_pats_grants, 0) as Life_Sciences_pats_grants,
  COALESCE(Security__eg_cybersecurity_pats_grants, 0) as Security__eg_cybersecurity_pats_grants,
  COALESCE(Transportation_pats_grants, 0) as Transportation_pats_grants,
  COALESCE(Industrial_and_Manufacturing_pats_grants, 0) as Industrial_and_Manufacturing_pats_grants,
  COALESCE(Education_pats_grants, 0) as Education_pats_grants,
  COALESCE(Document_Mgt_and_Publishing_pats_grants, 0) as Document_Mgt_and_Publishing_pats_grants,
  COALESCE(Military_pats_grants, 0) as Military_pats_grants,
  COALESCE(Agricultural_pats_grants, 0) as Agricultural_pats_grants,
  COALESCE(Computing_in_Government_pats_grants, 0) as Computing_in_Government_pats_grants,
  COALESCE(Personal_Devices_and_Computing_pats_grants, 0) as Personal_Devices_and_Computing_pats_grants,
  COALESCE(Banking_and_Finance_pats_grants, 0) as Banking_and_Finance_pats_grants,
  COALESCE(Telecommunications_pats_grants, 0) as Telecommunications_pats_grants,
  COALESCE(Networks__eg_social_IOT_etc_pats_grants, 0) as Networks__eg_social_IOT_etc_pats_grants,
  COALESCE(Business_pats_grants, 0) as Business_pats_grants,
  COALESCE(Energy_Management_pats_grants, 0) as Energy_Management_pats_grants,
  COALESCE(Entertainment_pats_grants, 0) as Entertainment_pats_grants,
  COALESCE(Nanotechnology_pats_grants, 0) as Nanotechnology_pats_grants,
  COALESCE(Semiconductors_pats_grants, 0) as Semiconductors_pats_grants,
  COALESCE(Language_Processing_pats_grants, 0) as Language_Processing_pats_grants,
  COALESCE(Speech_Processing_pats_grants, 0) as Speech_Processing_pats_grants,
  COALESCE(Knowledge_Representation_pats_grants, 0) as Knowledge_Representation_pats_grants,
  COALESCE(Planning_and_Scheduling_pats_grants, 0) as Planning_and_Scheduling_pats_grants,
  COALESCE(Control_pats_grants, 0) as Control_pats_grants,
  COALESCE(Distributed_AI_pats_grants, 0) as Distributed_AI_pats_grants,
  COALESCE(Robotics_pats_grants, 0) as Robotics_pats_grants,
  COALESCE(Computer_Vision_pats_grants, 0) as Computer_Vision_pats_grants,
  COALESCE(Analytics_and_Algorithms_pats_grants, 0) as Analytics_and_Algorithms_pats_grants,
  COALESCE(Measuring_and_Testing_pats_grants, 0) as Measuring_and_Testing_pats_grants,
  COALESCE(Logic_Programming_pats_grants, 0) as Logic_Programming_pats_grants,
  COALESCE(Fuzzy_Logic_pats_grants, 0) as Fuzzy_Logic_pats_grants,
  COALESCE(Probabilistic_Reasoning_pats_grants, 0) as Probabilistic_Reasoning_pats_grants,
  COALESCE(Ontology_Engineering_pats_grants, 0) as Ontology_Engineering_pats_grants,
  COALESCE(Machine_Learning_pats_grants, 0) as Machine_Learning_pats_grants,
  COALESCE(Search_Methods_pats_grants, 0) as Search_Methods_pats_grants,
FROM
  high_resolution_entities.aggregated_organizations
LEFT JOIN
  pattable
USING
  (CSET_id)
)
SELECT
  viz.*,
  grants_all.* EXCEPT (CSET_id)
FROM
  staging_ai_companies_visualization.patent_visualization_data_with_by_year AS viz
LEFT JOIN
  grants_all
USING
  (CSET_id)