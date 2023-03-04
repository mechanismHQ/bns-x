DROP MATERIALIZED VIEW "primary_names";

CREATE MATERIALIZED VIEW "primary_names" as
  with prev_nulls as (
    SELECT
      distinct on (account)
      value->>'account' as account
      , value->>'id' as id
      , "blockHeight"
      , "txIndex"
      , "eventIndex"
      , "microblockSequence"
    FROM "PrintEvent"
    where "contractId" like '%.bnsx-registry'
      and value->>'topic' = 'primary-update'
      and value->'prev' = 'null'
      and value->'id' != 'null'
      and "microblockCanonical" = true
      and canonical = true
    order by 
      account
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc
  ), prev_removes as (
    SELECT DISTINCT ON (account)
      p1.value->>'account' as account
      , p1.value->>'id' as id
      , p1."blockHeight"
      , p1."txIndex"
      , p1."eventIndex"
      , p1."microblockSequence"
    from "PrintEvent" p1
    inner join "PrintEvent" p2
      on p1.txid = p2.txid
    where p1."contractId" like '%.bnsx-registry'
      and p1.value->>'topic' = 'primary-update'
      and p1.txid = p2.txid
      and p2.value->>'topic' = 'remove'
      and p2.value->>'account' = p1.value->>'account'
      and p1."microblockCanonical" = true
      and p1.canonical = true
    order by account
      , p1."blockHeight" desc
      , p1."txIndex" desc
      , p1."eventIndex" desc
      , p1."microblockSequence" desc
  ), now_nulls as (
    SELECT
      distinct on (account)
      value->>'account' as account
      , value->>'id' as id
      , "blockHeight"
      , "txIndex"
      , "eventIndex"
      , "microblockSequence"
    FROM "PrintEvent"
    where "contractId" like '%.bnsx-registry'
      and value->>'topic' = 'primary-update'
      and value->'id' = 'null'
      and "microblockCanonical" = true
      and canonical = true
    order by 
      account
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc
  ), finals as (
    select
      distinct on (account)
      account
      ,id as primary_id
      , "blockHeight" as block_height
      , "microblockSequence" as microblock_sequence
      , "txIndex" as tx_index
      , "eventIndex" as event_index
    from (
      select account, id, "blockHeight", "microblockSequence", "txIndex", "eventIndex" from prev_nulls
      UNION ALL
      select account, id, "blockHeight", "microblockSequence", "txIndex", "eventIndex" from prev_removes
      UNION ALL
      select account, id, "blockHeight", "microblockSequence", "txIndex", "eventIndex" from now_nulls
    ) x
    order by
      account
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc
  )
  
  select
  	distinct on (primary_id)
    primary_id::bigint as primary_id
    , account
  from finals
  where primary_id is not null
  order by 
  primary_id
  ,block_height desc
  , microblock_sequence desc
  , tx_index desc
  , event_index desc
  ;

CREATE UNIQUE INDEX primary_names_account_idx on primary_names (account);
CREATE UNIQUE INDEX primary_names_id_idx on primary_names (primary_id);