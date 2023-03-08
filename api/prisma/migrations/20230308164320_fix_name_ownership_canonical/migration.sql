DROP MATERIALIZED VIEW name_ownership;

CREATE MATERIALIZED VIEW name_ownership as
  with last_ids as (
    SELECT
      distinct on (value->>'id')
      value->>'account' as account
      , value->>'id' as id
      , "blockHeight" as block_height
      , "microblockSequence" as microblock_sequence
      , "txIndex" as tx_index
      , "eventIndex" as event_index
    FROM "PrintEvent"
    where "contractId" like '%.bnsx-registry'
      and value->>'topic' = 'primary-update'
      and "microblockCanonical" = true
      and "canonical" = true
    order by 
      value->>'id'
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc
  ),

  burns as (
    select 
      distinct on (value->>'id')
      value->>'id' as id
    from "PrintEvent"
    where "contractId" like '%.bnsx-registry'
      and value->>'topic' = 'burn'
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
    , p1.account as account
  from last_ids p1
  left outer join burns p2 on p1.id = p2.id
  where p2.id is null
  and p1.id is not null
  order by p1.id::bigint desc
  ,block_height desc
  , microblock_sequence desc
  , tx_index desc
  , event_index desc;

CREATE UNIQUE INDEX name_ownership_id_idx on name_ownership (id);

CREATE INDEX name_ownership_account_idx on name_ownership (account);
