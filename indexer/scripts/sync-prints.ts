import type { BnsDbTypes } from '@db';
import { StacksDb, BnsDb } from '@db';
import { deserializeCV } from 'micro-stacks/clarity';
import { hexToBytes } from 'micro-stacks/common';
import { decodeClarityValue } from 'stacks-encoding-native-js';
import type { ContractLogs } from '../prisma/generated/stacks-api-schema';
import { cvToJSON } from '@clarigen/core';
import { logger } from '~/logger';

let prisma: BnsDb;
let stacksPrisma: StacksDb;

type LogKeys = ['block_height', 'microblock_sequence', 'tx_index', 'event_index'][number];

type WhereInput = Partial<Record<LogKeys, { gt: number } | { gte: number }>>;

const log = logger.child({
  topic: 'sync-prints',
});

// For initial run - we start 12 blocks prior to the last sync.
// After the initial run, we paginate based on a "cursor" of our sync.
async function getLogs(lastLog?: ContractLogs) {
  let whereInput: WhereInput;
  if (typeof lastLog === 'undefined') {
    // first run
    const existing = await prisma.printEvent.findFirst({
      orderBy: {
        blockHeight: 'desc',
      },
    });
    const lastHeight = existing?.blockHeight ?? 0;
    const syncHeight = Math.max(lastHeight - 12, 0);
    log.info({ lastHeight, syncHeight }, 'Starting log sync');
    whereInput = { block_height: { gte: syncHeight } };
  } else {
    // paginating
    const { block_height, microblock_sequence, tx_index, event_index } = lastLog;
    whereInput = {
      block_height: { gte: block_height },
      microblock_sequence: { gte: microblock_sequence },
      tx_index: { gte: tx_index },
      event_index: { gt: event_index },
    };
  }
  const logs = await stacksPrisma.contractLogs.findMany({
    where: {
      contract_identifier: {
        startsWith: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      },
      ...whereInput,
    },
    orderBy: [
      { block_height: 'asc' },
      { microblock_sequence: 'asc' },
      { tx_index: 'asc' },
      { event_index: 'asc' },
    ],
    take: 100,
  });
  log.info(
    {
      newLogs: logs.length,
    },
    `Syncing ${logs.length} logs`
  );

  const lastSynced = await processLogs(logs);
  if (typeof lastSynced === 'undefined') {
    log.info('Finished print syncs');
    // we are done
    return;
  }
  await getLogs(lastSynced);
}

// Create or update "printEvent" table based on raw logs
async function processLogs(logs: ContractLogs[]) {
  const mappedLogs: (ContractLogs & { json: BnsDbTypes.InputJsonValue; hex: Uint8Array })[] = [];

  logs.forEach(log => {
    const hex = log.value;
    const dec = decodeClarityValue(hex);
    const cv = deserializeCV(dec.hex);
    const value: BnsDbTypes.InputJsonValue = cvToJSON(cv);
    mappedLogs.push({
      ...log,
      json: value,
      hex: hexToBytes(dec.hex),
    });
  });

  const syncs = mappedLogs.map(async contractLog => {
    const baseProps: BnsDbTypes.PrintEventCreateInput = {
      stacksApiId: contractLog.id,
      microblockCanonical: contractLog.microblock_canonical,
      canonical: contractLog.canonical,
      microblockSequence: contractLog.microblock_sequence,
      contractId: contractLog.contract_identifier,
      value: contractLog.json,
      hex: Buffer.from(contractLog.hex),
      topic: contractLog.topic ?? '',
      txIndex: contractLog.tx_index,
      eventIndex: contractLog.event_index,
      blockHeight: contractLog.block_height,
      indexBlockHash: contractLog.index_block_hash,
      microblockHash: contractLog.microblock_hash,
      txid: contractLog.tx_id,
    };
    log.info(
      {
        print: contractLog.json,
      },
      'New contract log'
    );
    await prisma.printEvent.upsert({
      where: {
        blockHeight_microblockSequence_txIndex_eventIndex: {
          blockHeight: contractLog.block_height,
          microblockSequence: contractLog.microblock_sequence,
          txIndex: contractLog.tx_index,
          eventIndex: contractLog.event_index,
        },
      },
      create: baseProps,
      update: {
        ...baseProps,
      },
    });
  });

  await Promise.all(syncs);
  return logs[logs.length - 1];
}

async function run() {
  stacksPrisma = new StacksDb();
  prisma = new BnsDb();

  await Promise.all([prisma.$connect(), stacksPrisma.$connect()]);

  await getLogs();
}

run()
  .catch(console.error)
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await Promise.all([prisma.$disconnect(), stacksPrisma.$disconnect()]);
    process.exit();
  });
