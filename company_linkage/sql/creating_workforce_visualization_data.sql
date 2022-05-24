SELECT
  DISTINCT cset_id,
  COUNT(DISTINCT user_id) AS tt1_jobs
FROM
  high_resolution_entities.organizations
INNER JOIN
  `gcp-cset-projects.gcp_cset_revelio.position` position
ON
  linkedin = company_li_url
INNER JOIN
  gcp_cset_revelio.role_lookup
USING
  (mapped_role)
INNER JOIN
  ai_companies_visualization.tech_talent_1
ON
  (k1000 = role_k1000)
LEFT JOIN
  gcp_cset_revelio.education
USING
  (user_id)
WHERE
  (position.enddate IS NULL
  OR position.enddate > CURRENT_DATE())
  AND (ba_req IS FALSE
    OR ((degree = "Bachelor"
        OR degree = "Master"
        OR degree = "Doctor")
      AND REGEXP_CONTAINS(field_raw, r'(?i)(computer\s+science|computer\s+engineering|electrical\s+engineering)')))
  AND (phd_req IS FALSE
    OR ((degree = "Doctor")
      AND REGEXP_CONTAINS(field_raw, r'(?i)(computer\s+science|computer\s+engineering|electrical\s+engineering)')))
GROUP BY
  cset_id
ORDER BY
  cset_id