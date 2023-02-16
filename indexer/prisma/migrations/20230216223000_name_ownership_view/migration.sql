CREATE MATERIALIZED VIEW name_ownership as
  with last_ids as (
    SELECT
      distinct on (value->>'id')
      value->>'account' as account
      , value->>'id' as id
    FROM "PrintEvent"
    where "contractId" like '%.bnsx-registry'
      and value->>'topic' = 'primary-update'
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
    order by
      value->>'id'
      , "blockHeight" desc
      , "microblockSequence" desc
      , "txIndex" desc
      , "eventIndex" desc	
  )

  select
    p1.id::bigint as id
    , p1.account as account
  from last_ids p1
  left outer join burns p2 on p1.id = p2.id
  where p2.id is null
  and p1.id is not null;

CREATE UNIQUE INDEX name_ownership_id_idx on name_ownership (id);

CREATE INDEX name_ownership_account_idx on name_ownership (account);
