CREATE OR REPLACE TABLE
  ai_companies_visualization.pubs_in_top_conferences_no_grid AS
  -- Get every paper id from the scientific literature that was published in one of the top AI conferences
WITH
  sources AS (
  SELECT
    merged_id,
    source_title,
    year
  FROM
    `gcp-cset-projects.gcp_cset_links_v2.corpus_merged`
  WHERE
    -- The list of top conferences, derived from csrankings.org. Regular expressions selected using DBLP to find all possibilities, and evaluating results produced to avoid false positives.
    REGEXP_CONTAINS(source_title, r'(?i)AAAI Conference on Artificial Intelligence')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bAAAI\b')
    OR REGEXP_CONTAINS(source_title, r'(?i)International Joint Conference on Artificial Intelligence')
      OR REGEXP_CONTAINS(source_title, r'(?i)IJCAI')
    OR REGEXP_CONTAINS(source_title, r'(?i)IEEE Conference on Computer Vision and Pattern Recognition')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bCVPR')
    OR REGEXP_CONTAINS(source_title, r'(?i)European Conference on Computer Vision')
      OR REGEXP_CONTAINS(source_title, r'(?i)ECCV')
    OR REGEXP_CONTAINS(source_title, r'(?i)IEEE.*International Conference on Computer Vision')
      OR REGEXP_CONTAINS(source_title, r'(?i)ICCV\b')
    OR (REGEXP_CONTAINS(source_title, r'(?i)International Conference on Machine Learning')
      AND NOT REGEXP_CONTAINS(source_title, r'(?i)and'))
      OR REGEXP_CONTAINS(source_title, r'(?i)ICML\b')
    OR REGEXP_CONTAINS(source_title, r'(?i)International Conference on Knowledge Discovery [a|\&]n?d? Data Mining')
      OR REGEXP_CONTAINS(source_title, r'(?i)SIGKDD')
    OR REGEXP_CONTAINS(source_title, r'(?i)Neural Information Processing Systems')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bNeurIPS\b')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bNIPS\b')
    OR REGEXP_CONTAINS(source_title, r'(?i)Annual Meeting of the Association for Computational Linguistics')
      OR ( REGEXP_CONTAINS(source_title, r'(?i)\bACL\b')
        AND NOT REGEXP_CONTAINS(source_title, r'(?i)injur')
        AND NOT REGEXP_CONTAINS(source_title, r'(?i)surgery'))
    OR REGEXP_CONTAINS(source_title, r'(?i)North American Chapter of the Association for Computational Linguistics')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bNAACL\b')
    OR REGEXP_CONTAINS(source_title, r'(?i)Conference on Empirical Methods in Natural Language Processing')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bEMNLP\b')
    OR REGEXP_CONTAINS(source_title, r'(?i)International.*Conference on Research and Development in Information Retrieval')
      OR REGEXP_CONTAINS(source_title, r'(?i)\bSIGIR\b')
    OR REGEXP_CONTAINS(source_title, r'(?i)International Conference on World Wide Web')
      OR REGEXP_CONTAINS(source_title, r'(?i)International World Wide Web Conference')
      OR REGEXP_CONTAINS(source_title, r'(?i)The Web Conference') ),
  -- Associating GRIDs to the merged paper ids
  affils AS (
  SELECT
    merged_id,
    org_name AS raw_org_name,
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
    gcp-cset-projects.gcp_cset_grid.api_grid),
  -- We're grouping papers by grid here because we want to exclude all the paper-grid pairs that have a non-null GRID since those will have been included in the with-grid table.
  -- We're not concerned about excluding papers that have grid, though (in fact, we don't want to) because some papers may have an affiliate with GRID and an affiliate without and we
  -- want to include them under both. And we're only querying with regex for affiliates that don't have GRID so we won't double-count.
  papers_grouped_by_grid AS (
  SELECT
  -- We're aggregating with ^ because it doesn't show up in the org names. This doesn't matter much because we're just searching with regex, but we don't want to introduce anything.
    STRING_AGG(raw_org_name, "^") AS org_names,
    sources.merged_id,
    grid_id,
    year
  FROM
    sources
  INNER JOIN
    affils
  ON
    sources.merged_id = affils.merged_id
  GROUP BY
    grid_id,
    sources.merged_id,
    year)
 -- Now we take out the GRIDS and only include the rows where the GRIDs are null.
SELECT
  merged_id,
  org_names,
  year
FROM
  papers_grouped_by_grid
WHERE
  grid_id IS NULL
  OR grid_id = ""