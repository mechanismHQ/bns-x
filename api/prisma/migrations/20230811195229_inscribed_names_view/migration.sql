CREATE MATERIALIZED VIEW inscribed_names as
  with last_ids as (
    select
      distinct on (value ->> 'id')
      value->>'account' as account
      , value->>'id' as id
      , value->>'inscriptionId' as inscription_id
      , "blockHeight" as block_height
      , "microblockSequence" as microblock_sequence
      , "txIndex" as tx_index
      , "eventIndex" as event_index
    FROM "PrintEvent"
    where "contractId" like '%.l1-registry'
      and value->>'topic' = 'wrap'
      and "microblockCanonical" = true
      and "canonical" = true
    order by 
      value->>'id'
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc
  ),

  unwraps as (
    select 
      distinct on (value->>'id')
      value->>'id' as id
    from "PrintEvent"
    where "contractId" like '%.l1-registry'
      and value->>'topic' = 'unwrap'
      and "microblockCanonical" = true
      and "canonical" = true
    order by
      value->>'id'
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc	
  )

  select
    distinct on (p1.id::bigint)
    p1.id::bigint as id
    , p1.inscription_id as inscription_id
  from last_ids p1
  left outer join unwraps as p2 on p1.id = p2.id
  where p2.id is null
  and p1.id is not null
  order by p1.id::bigint desc
    , block_height desc
    , microblock_sequence desc
    , tx_index desc
    , event_index desc;

CREATE UNIQUE INDEX inscribed_names_id_idx on inscribed_names (id);

CREATE INDEX inscribed_names_inscription_id_idx on inscribed_names (inscription_id);