WITH
  aipats AS (
    -- Pulling all the patents from any of our companies
  SELECT
    *
  FROM
    ai_companies_visualization.ai_company_patents),
  pattable AS (
    -- Getting the count of patents
  SELECT
    CSET_id,
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
    CSET_id)
  -- Pulling CSET_id and name, plus ai_pats
SELECT
  CSET_id,
  name,
  COALESCE(ai_patents, 0) as ai_patents,
  COALESCE(Physical_Sciences_and_Engineering_pats, 0) as Physical_Sciences_and_Engineering_pats,
  COALESCE(Life_Sciences_pats, 0) as Life_Sciences_pats,
  COALESCE(Security__eg_cybersecurity_pats, 0) as Security__eg_cybersecurity_pats,
  COALESCE(Transportation_pats, 0) as Transportation_pats,
  COALESCE(Industrial_and_Manufacturing_pats, 0) as Industrial_and_Manufacturing_pats,
  COALESCE(Education_pats, 0) as Education_pats,
  COALESCE(Document_Mgt_and_Publishing_pats, 0) as Document_Mgt_and_Publishing_pats,
  COALESCE(Military_pats, 0) as Military_pats,
  COALESCE(Agricultural_pats, 0) as Agricultural_pats,
  COALESCE(Computing_in_Government_pats, 0) as Computing_in_Government_pats,
  COALESCE(Personal_Devices_and_Computing_pats, 0) as Personal_Devices_and_Computing_pats,
  COALESCE(Banking_and_Finance_pats, 0) as Banking_and_Finance_pats,
  COALESCE(Telecommunications_pats, 0) as Telecommunications_pats,
  COALESCE(Networks__eg_social_IOT_etc_pats, 0) as Networks__eg_social_IOT_etc_pats,
  COALESCE(Business_pats, 0) as Business_pats,
  COALESCE(Energy_Management_pats, 0) as Energy_Management_pats,
  COALESCE(Entertainment_pats, 0) as Entertainment_pats,
  COALESCE(Nanotechnology_pats, 0) as Nanotechnology_pats,
  COALESCE(Semiconductors_pats, 0) as Semiconductors_pats,
  COALESCE(Language_Processing_pats, 0) as Language_Processing_pats,
  COALESCE(Speech_Processing_pats, 0) as Speech_Processing_pats,
  COALESCE(Knowledge_Representation_pats, 0) as Knowledge_Representation_pats,
  COALESCE(Planning_and_Scheduling_pats, 0) as Planning_and_Scheduling_pats,
  COALESCE(Control_pats, 0) as Control_pats,
  COALESCE(Distributed_AI_pats, 0) as Distributed_AI_pats,
  COALESCE(Robotics_pats, 0) as Robotics_pats,
  COALESCE(Computer_Vision_pats, 0) as Computer_Vision_pats,
  COALESCE(Analytics_and_Algorithms_pats, 0) as Analytics_and_Algorithms_pats,
  COALESCE(Measuring_and_Testing_pats, 0) as Measuring_and_Testing_pats,
  COALESCE(Logic_Programming_pats, 0) as Logic_Programming_pats,
  COALESCE(Fuzzy_Logic_pats, 0) as Fuzzy_Logic_pats,
  COALESCE(Probabilistic_Reasoning_pats, 0) as Probabilistic_Reasoning_pats,
  COALESCE(Ontology_Engineering_pats, 0) as Ontology_Engineering_pats,
  COALESCE(Machine_Learning_pats, 0) as Machine_Learning_pats,
  COALESCE(Search_Methods_pats, 0) as Search_Methods_pats,
FROM
  `gcp-cset-projects.high_resolution_entities.aggregated_organizations` AS orgs
LEFT JOIN
  pattable
USING
  (CSET_id)