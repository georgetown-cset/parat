WITH
  clean_linkedins AS (
  SELECT
    DISTINCT cset_id,
    name,
    REPLACE(REPLACE(linkedins, "https://www.", ""), "http://www.", "") AS linkedin
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN
    UNNEST (linkedin) AS linkedins),
  new_ai_jobs AS (
  SELECT
    DISTINCT cset_id,
    COUNT(DISTINCT individual_position.user_id) AS ai_jobs
  FROM
    clean_linkedins
  INNER JOIN
    revelio.individual_position
  ON
    linkedin = company_linkedin_url
  INNER JOIN
    revelio.role_lookup
  USING
    (mapped_role)
  INNER JOIN
    ai_companies_visualization.tech_talent_1
  ON
    (k1000 = role_k1000)
  LEFT JOIN
    revelio.individual_education
  USING
    (user_id)
  LEFT JOIN
    revelio.individual_position_descriptions
  USING
    (position_id)
  WHERE
    (individual_position.enddate IS NULL
      OR individual_position.enddate > CURRENT_DATE())
    AND (ba_req IS FALSE
      OR ((degree = "Bachelor"
          OR degree = "Master"
          OR degree = "Doctor")
        AND REGEXP_CONTAINS(field_raw, r'(?i)(computer\s+science|computer\s+engineering|electrical\s+engineering)')))
    AND (phd_req IS FALSE
      OR ((degree = "Doctor")
        AND REGEXP_CONTAINS(field_raw, r'(?i)(computer\s+science|computer\s+engineering|electrical\s+engineering)')))
    AND ((data_science IS TRUE)
      OR (research IS TRUE
        AND REGEXP_CONTAINS(description, r'(?i)(\bai\b|artificial\s+intelligence|machine\s+learning|supervised\s+learning|unsupervised\s+learning|reinforcement\s+learning|deep\s+learning|neural\s+net|computer\s+vision|\bnlp\b|natural\s+language\s+processing|facial\s+recognition|biometrics|robotics|augmented\s+reality|autonomous|human\s+machine)')))
  GROUP BY
    cset_id)
SELECT
  cset_id,
  tt1_jobs,
  COALESCE(ai_jobs, 0) as ai_jobs
FROM
  staging_ai_companies_visualization.initial_workforce_visualization_data
LEFT JOIN
  new_ai_jobs
USING
  (cset_id)
ORDER BY
  cset_id