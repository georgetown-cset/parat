with names as (
select
  best_name as name
from
  cset_entity_resolution_internal.bloomberg_vendors_resolution
union all
select
  canon_employer as name
from
  cset_entity_resolution_internal.burning_glass_jobs_resolution
union all
select
  name
from
  cset_entity_resolution_internal.high_resolution_companies_preannotation
union all
select
  name
from
  cset_entity_resolution_internal.initial_bgov_companies_preannotation
union all
select
  name
from
  cset_entity_resolution_internal.sandp500_preannotation
)

select distinct(name) as name from names