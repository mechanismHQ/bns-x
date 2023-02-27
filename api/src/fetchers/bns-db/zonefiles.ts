import type { BnsDb } from '@db';
import { expectDb } from '@db/db-utils';

export async function fetchNostrNames(db?: BnsDb) {
  expectDb(db);

  const zonefiles = await db.$queryRaw<{ name: string; namespace: string; zonefileRaw: string }[]>`
    SELECT
      distinct on (name, namespace)
      name
      , namespace
      , "zonefileRaw"
    from "InscriptionZonefiles"
    WHERE
      "zonefileRaw" like '%_._nostr%'
    order by name, namespace, "genesisHeight" desc
    limit 1000
  `;

  return zonefiles.map(z => ({
    name: `${z.name}.${z.namespace}`,
    zonefile: z.zonefileRaw,
  }));
}
