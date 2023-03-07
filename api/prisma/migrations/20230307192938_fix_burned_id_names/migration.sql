DROP MATERIALIZED VIEW "names";

CREATE MATERIALIZED VIEW "names" as
  with all_names as (
    SELECT
      distinct on (name, namespace)
      (value->>'id') as id,
      value->'name'->>'name' as name,
      value->'name'->>'namespace' as namespace,
      "blockHeight" as block_height,
      "microblockSequence" as microblock_sequence,
      "txIndex" as tx_index,
      "eventIndex" as event_index
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
    distinct on (n.id::bigint)
   	n.id::bigint as id
    , n.name as name
    , n.namespace as namespace
  from all_names n
  left outer join burns b on n.id = b.id
  where 
    b.id is null
    and n.id is not null
  order by id desc,
  block_height desc,
  microblock_sequence desc,
  tx_index desc,
  event_index desc;

CREATE UNIQUE INDEX names_id_idx on names (
  id
);

CREATE UNIQUE INDEX names_name_namespace_idx on names (
  name,
  namespace
);
