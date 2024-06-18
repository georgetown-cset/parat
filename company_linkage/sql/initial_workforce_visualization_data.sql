WITH
  clean_linkedins AS (
  SELECT
    DISTINCT cset_id,
    name,
    TRIM(REPLACE(REPLACE(linkedins, "https://www.", ""), "http://www.", ""), "/") AS linkedin
  FROM
    high_resolution_entities.aggregated_organizations
  CROSS JOIN
    UNNEST (linkedin) AS linkedins),
job_info as
(SELECT
  DISTINCT cset_id,
  COUNT(DISTINCT user_id) AS tt1_jobs
FROM
  clean_linkedins
LEFT JOIN
  revelio.individual_position
ON
  linkedin = TRIM(company_linkedin_url, "/")
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
WHERE
  (individual_position.enddate IS NULL
    OR individual_position.enddate > CURRENT_DATE ())
  AND (ba_req IS FALSE
    OR ((degree = "Bachelor"
        OR degree = "Master"
        OR degree = "Doctor")
      AND REGEXP_CONTAINS(field_raw, r'(?i)(computer\s+science|computer\s+engineering|electrical\s+engineering)')))
  AND (phd_req IS FALSE
    OR ((degree = "Doctor")
      AND REGEXP_CONTAINS(field_raw, r'(?i)(computer\s+science|computer\s+engineering|electrical\s+engineering)')))
GROUP BY
  cset_id)
SELECT
  DISTINCT
  cset_id,
  COALESCE(tt1_jobs, 0) as tt1_jobs
FROM
  high_resolution_entities.aggregated_organizations
LEFT JOIN
  job_info
USING
  (cset_id)
ORDER BY
  cset_id