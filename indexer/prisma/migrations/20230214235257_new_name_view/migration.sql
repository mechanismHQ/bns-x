CREATE MATERIALIZED VIEW "names" as
  SELECT
    distinct on (id, name, namespace)
    txid,
    (value->>'id')::bigint as id,
    value->'name'->>'name' as name,
    value->'name'->>'namespace' as namespace
  FROM "PrintEvent"
  WHERE
    value->>'topic' = 'new-name'
    and "microblockCanonical" = true
    and "canonical" = true
  ORDER BY
    id,
    name,
    namespace,
    "blockHeight" desc,
    "microblockSequence" desc,
    "txIndex" desc,
    "eventIndex" desc;

CREATE UNIQUE INDEX names_id_idx on names (
  id
);

CREATE UNIQUE INDEX names_name_namespace_idx on names (
  name,
  namespace
);