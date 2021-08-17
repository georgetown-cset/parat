CREATE OR REPLACE TABLE
  ai_companies_visualization.pubs_in_top_conferences_grid AS
-- Get every paper id from the scientific literature that was published in one of the top AI conferences
WITH
  sources AS (
SELECT
    DISTINCT
    merged_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_sources_merged`
  WHERE
  -- The list of top conferences, derived from csrankings.org. Regular expressions selected using DBLP to find all possibilities, and evaluating results produced to avoid false positives.
    REGEXP_CONTAINS(source_name, r'(?i)AAAI Conference on Artificial Intelligence')
      OR REGEXP_CONTAINS(source_name, r'(?i)\(AAAI-')
    OR (REGEXP_CONTAINS(source_name, r'(?i)International Joint Conference on Artificial Intelligence')
      OR REGEXP_CONTAINS(source_name, r'(?i)IJCAI'))
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)Multimedia for Cooking and Eating Activities')
    OR REGEXP_CONTAINS(source_name, r'(?i)IEEE Conference on Computer Vision and Pattern Recognition')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bCVPR')
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)旷视科技征战')
    OR REGEXP_CONTAINS(source_name, r'(?i)European Conference on Computer Vision')
      OR REGEXP_CONTAINS(source_name, r'(?i)ECCV ')
    OR REGEXP_CONTAINS(source_name, r'(?i)IEEE.*International Conference on Computer Vision')
      OR REGEXP_CONTAINS(source_name, r'(?i)ICCV\b')
    OR (REGEXP_CONTAINS(source_name, r'(?i)International Conference on Machine Learning')
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)(and)|(technologies)|(cybernetics)'))
      OR (REGEXP_CONTAINS(source_name, r'(?i)\bICML\b')
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)(medical|lugano)'))
    OR REGEXP_CONTAINS(source_name, r'(?i)International Conference on Knowledge Discovery [a|\&]n?d? Data Mining')
      OR REGEXP_CONTAINS(source_name, r'(?i)SIGKDD')
    OR REGEXP_CONTAINS(source_name, r'(?i)Neural Information Processing Systems')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bNeurIPS\b')
    OR REGEXP_CONTAINS(source_name, r'(?i)Annual Meeting of the Association for Computational Linguistics')
      OR ( REGEXP_CONTAINS(source_name, r'\bACL\b')
      AND conference = 1
    AND NOT REGEXP_CONTAINS(source_name, r'(?i)(injur)|(special interest)|(coling)'))
    OR REGEXP_CONTAINS(source_name, r'(?i)North American Chapter of the Association for Computational Linguistics')
         OR REGEXP_CONTAINS(source_name, r'(?i)\bNAACL\b')
    OR REGEXP_CONTAINS(source_name, r'(?i)Conference on Empirical Methods in Natural Language Processing')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bEMNLP\b')
    OR ((REGEXP_CONTAINS(source_name, r'(?i)International.*Conference on Research and Development in Information Retrieval')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bSIGIR\b'))
      AND conference = 1
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)(ICTIR)|(CHIIR)'))
    OR REGEXP_CONTAINS(source_name, r'(?i)International Conference on World Wide Web')
      OR REGEXP_CONTAINS(source_name, r'(?i)International World Wide Web Conference')
      OR REGEXP_CONTAINS(source_name, r'(?i)The Web Conference')
      OR REGEXP_CONTAINS(source_name, r'(?i)world wide web conference')
),
with_dates as
(SELECT
  merged_id,
  year
  FROM
  sources
  LEFT JOIN
  `gcp-cset-projects.gcp_cset_links_v2.corpus_merged`
  USING (merged_id)
  ),
       -- Associating GRIDs to the merged paper ids
  affils AS (
  SELECT
    merged_id,
    grid_id
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.paper_affiliations_merged`),
  -- Associating GRID organizational information to the GRIDs, for consistent naming and locational information
  grid_data AS (
  SELECT
    id,
    name AS org_name,
    country_name AS country
  FROM
    gcp-cset-projects.gcp_cset_grid.api_grid)
-- For every paper that was published at a top AI conference, we want its paper id, its grid, and its grid-base org name
SELECT DISTINCT org_name,
                grid_id,
                with_dates.merged_id,
    year
FROM
    with_dates
    -- We're inner joining because if there's no affiliate information at all we have no way to even evaluate this data for our purposes
    INNER JOIN
    affils
ON
    with_dates.merged_id = affils.merged_id
    -- We're inner joining for this particular version (the with-grid one) because if there's no grid we're going to use the without-grid version and search with a regular expression instead.
    INNER JOIN
    grid_data
    ON
    affils.Grid_ID = grid_data.id
GROUP BY
    Grid_ID,
    org_name,
    with_dates.merged_id,
    year