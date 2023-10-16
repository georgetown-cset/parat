SELECT
  COUNT(*) = 0
FROM
  staging_ai_companies_visualization.patent_visualization_data_with_by_year
WHERE
  ai_patents IS NULL
  OR Physical_Sciences_and_Engineering_pats IS NULL
  OR Life_Sciences_pats IS NULL
  OR Security__eg_cybersecurity_pats IS NULL
  OR Transportation_pats IS NULL
  OR Education_pats IS NULL
  OR Document_Mgt_and_Publishing_pats IS NULL
  OR Military_pats IS NULL
  OR Agricultural_pats IS NULL
  OR Computing_in_Government_pats IS NULL
  OR Personal_Devices_and_Computing_pats IS NULL
  OR Banking_and_Finance_pats IS NULL
  OR Telecommunications_pats IS NULL
  OR Networks__eg_social_IOT_etc_pats IS NULL
  OR Business_pats IS NULL
  OR Energy_Management_pats IS NULL
  OR Entertainment_pats IS NULL
  OR Nanotechnology_pats IS NULL
  OR Semiconductors_pats IS NULL
  OR Language_Processing_pats IS NULL
  OR Speech_Processing_pats IS NULL
  OR Knowledge_Representation_pats IS NULL
  OR Planning_and_Scheduling_pats IS NULL
  OR Control_pats IS NULL
  OR Distributed_AI_pats IS NULL
  OR Robotics_pats IS NULL
  OR Computer_Vision_pats IS NULL
  OR Analytics_and_Algorithms_pats IS NULL
  OR Measuring_and_Testing_pats IS NULL
  OR Logic_Programming_pats IS NULL
  OR Fuzzy_Logic_pats IS NULL
  OR Probabilistic_Reasoning_pats IS NULL
  OR Ontology_Engineering_pats IS NULL
  OR Machine_Learning_pats IS NULL
  OR Search_Methods_pats IS NULL