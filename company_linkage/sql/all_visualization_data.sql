select
  visualization_data.CSET_id as cset_id,
  visualization_data.name,
  * except(CSET_id, name)
from
  staging_ai_companies_visualization.visualization_data
left join
  staging_ai_companies_visualization.paper_visualization_data
using(CSET_id)
left join
  staging_ai_companies_visualization.patent_visualization_data
using(CSET_id)
left join
  staging_ai_companies_visualization.workforce_visualization_data
using(CSET_id)