DROP MATERIALIZED VIEW "names";

CREATE MATERIALIZED VIEW "names" as
  with all_names as (
    SELECT
      distinct on (name, namespace)
      (value->>'id') as id,
      value->'name'->>'name' as name,
      value->'name'->>'namespace' as namespace
    FROM "PrintEvent"
    WHERE
      value->>'topic' = 'new-name'
      and "contractId" like '%.bnsx-registry'
      and "microblockCanonical" = true
      and "canonical" = true
    ORDER BY
      name,
      namespace,
      "blockHeight" desc,
      "microblockSequence" desc,
      "txIndex" desc,
      "eventIndex" desc
  ),

  burns as (
    select 
        distinct on (value->>'id')
        value->>'id' as id
      from "PrintEvent"
      where "contractId" like '%.bnsx-registry'
        and value->>'topic' = 'burn'
      order by
        value->>'id'
        , "blockHeight" desc
        , "microblockSequence" desc
        , "txIndex" desc
        , "eventIndex" desc	
  )

  select 
    n.id::bigint as id
    , n.name as name
    , n.namespace as namespace
  from all_names n
  left outer join burns b on n.id = b.id
  where 
    b.id is null
    and n.id is not null;

CREATE UNIQUE INDEX names_id_idx on names (
  id
);

CREATE UNIQUE INDEX names_name_namespace_idx on names (
  name,
  namespace
);
