import { BnsDbTypes, refreshMaterializedViews } from '@db';
import { StacksDb, BnsDb } from '@db';
import { syncPrints } from '~/sync/prints';
import { hexToBytes } from 'micro-stacks/common';
import { logger } from '~/logger';

async function run() {
  const bnsDb = new BnsDb();
  const stacksDb = new StacksDb();
  await bnsDb.$connect();
  await stacksDb.$connect();

  const logs = await stacksDb.contractLogs.findMany({
    where: {
      tx_id: Buffer.from(
        hexToBytes('ce16daa637c8a1def256e81a657185535ad396afe6c26ebceba61d326d208e2a')
      ),
    },
  });
  console.log(logs.length);

  await Promise.all(
    logs.map(async contractLog => {
      const existing = await bnsDb.printEvent.findFirst({
        where: {
          txid: contractLog.tx_id,
          eventIndex: contractLog.event_index,
          microblockSequence: contractLog.microblock_sequence,
          txIndex: contractLog.tx_index,
          blockHeight: contractLog.block_height,
        },
      });

      logger.debug({
        blockHeight: contractLog.block_height,
        hasExisting: !!existing,
        log: {
          canonical: contractLog.canonical,
          microblock: contractLog.microblock_canonical,
        },
        existing: {
          canonical: existing?.canonical,
          microblock: existing?.microblockCanonical,
        },
      });
    })
  );
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
