import type { StacksDb } from '@db';
import { expectDb } from '@db/db-utils';

export async function fetchNostrNames(db: StacksDb) {
  const zonefiles = await db.$queryRaw<{ zonefile: string; name: string }[]>`
    SELECT
      distinct on (name)
      name
      , zonefile
    FROM zonefiles
    INNER JOIN txs USING (tx_id)
    WHERE 
      zonefile like '%_._nostr%'
      and canonical = true
      and microblock_canonical = true
    order by name, block_height desc
    LIMIT 1000;
  `;
  return zonefiles;
}
