CREATE OR REPLACE TABLE
  ai_companies_visualization.top_conference_pubs AS
WITH
  venues AS (
SELECT
    DISTINCT
    merged_id
  FROM
    literature.venues
  WHERE
  -- The list of top conferences, derived from csrankings.org. Regular expressions selected using DBLP to find all possibilities, and evaluating results produced to avoid false positives.
    (REGEXP_CONTAINS(source_name, r'(?i)AAAI Conference on Artificial Intelligence')
      OR REGEXP_CONTAINS(source_name, r'(?i)\(AAAI-'))
      AND NOT
    REGEXP_CONTAINS(source_name, r'(?i)Interactive Digital Entertainment|\bAAIDE\b')
    OR (REGEXP_CONTAINS(source_name, r'(?i)International Joint Conference on Artificial Intelligence')
      OR REGEXP_CONTAINS(source_name, r'(?i)IJCAI'))
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)Multimedia for Cooking and Eating Activities')
    OR REGEXP_CONTAINS(source_name, r'(?i)IEEE Conference on Computer Vision and Pattern Recognition')
      OR REGEXP_CONTAINS(source_name, r'(?i)IEEE Computer Society Conference on Computer Vision and Pattern Recognition')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bCVPR')
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)旷视科技征战')
    OR REGEXP_CONTAINS(source_name, r'(?i)European Conference on Computer Vision')
      OR REGEXP_CONTAINS(source_name, r'(?i)ECCV ')
    OR REGEXP_CONTAINS(source_name, r'(?i)IEEE.*International Conference on Computer Vision')
      OR REGEXP_CONTAINS(source_name, r'(?i)ICCV\b')
    OR (REGEXP_CONTAINS(source_name, r'(?i)International Conference on Machine Learning')
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)(and)|(technologies)|(cybernetics)|(machine learning for)'))
      OR (REGEXP_CONTAINS(source_name, r'(?i)\bICML\b')
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)(medical|lugano)'))
    OR REGEXP_CONTAINS(source_name, r'(?i)International Conference on Knowledge Discovery [a|\&]n?d? Data Mining')
      OR REGEXP_CONTAINS(source_name, r'(?i)SIGKDD')
    OR REGEXP_CONTAINS(source_name, r'(?i)Neural Information Processing Systems')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bNeurIPS\b')
    OR REGEXP_CONTAINS(source_name, r'(?i)Annual Meeting of the Association for Computational Linguistics')
      OR ( REGEXP_CONTAINS(source_name, r'\bACL\b')
      AND is_conference IS TRUE
    AND NOT REGEXP_CONTAINS(source_name, r'(?i)(injur)|(special interest)|(coling)'))
    OR REGEXP_CONTAINS(source_name, r'(?i)North American Chapter of the Association for Computational Linguistics')
         OR REGEXP_CONTAINS(source_name, r'(?i)\bNAACL\b')
    OR (REGEXP_CONTAINS(source_name, r'(?i)Conference on Empirical Methods in Natural Language Processing')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bEMNLP\b'))
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)SIGDAT')
    OR ((REGEXP_CONTAINS(source_name, r'(?i)International.*Conference on Research and Development in Information Retrieval')
      OR REGEXP_CONTAINS(source_name, r'(?i)\bSIGIR\b'))
      AND is_conference IS TRUE
      AND NOT REGEXP_CONTAINS(source_name, r'(?i)(ICTIR)|(CHIIR)'))
    OR REGEXP_CONTAINS(source_name, r'(?i)International Conference on World Wide Web')
      OR REGEXP_CONTAINS(source_name, r'(?i)International World Wide Web Conference')
      OR REGEXP_CONTAINS(source_name, r'(?i)The Web Conference')
      OR REGEXP_CONTAINS(source_name, r'(?i)world wide web conference')
)

SELECT
  merged_id,
  year
  FROM
  venues
  LEFT JOIN
  literature.papers
  USING (merged_id)