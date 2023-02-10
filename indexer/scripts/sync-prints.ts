import { StacksPrisma } from '../src/stacks-api-db/client';
import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { deserializeCV, cvToTrueValue, cvToHex } from 'micro-stacks/clarity';
import { bytesToHex, hexToBytes } from 'micro-stacks/common';
import { decodeClarityValue } from 'stacks-encoding-native-js';
import type { ContractLogs } from '../prisma/generated/stacks-api-schema';
import { cvToJSON } from '@clarigen/core';

let prisma: PrismaClient;
let stacksPrisma: StacksPrisma;

type LogKeys = ['block_height', 'microblock_sequence', 'tx_index', 'event_index'][number];

type WhereInput = Partial<Record<LogKeys, { gt: number } | { gte: number }>>;

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
      { block_height: 'asc', microblock_sequence: 'asc', tx_index: 'asc', event_index: 'asc' },
    ],
    take: 100,
  });

  const lastSynced = await processLogs(logs);
  if (typeof lastSynced === 'undefined') {
    // we are done
    return;
  }
  await getLogs(lastSynced);
}

// Create or update "printEvent" table based on raw logs
async function processLogs(logs: ContractLogs[]) {
  const mappedLogs: (ContractLogs & { json: any; hex: Uint8Array })[] = [];

  logs.forEach(log => {
    const hex = log.value;
    const dec = decodeClarityValue(hex);
    const cv = deserializeCV(dec.hex);
    const value = cvToJSON(cv);
    console.log('value', value);
    console.log(log.contract_identifier);
    mappedLogs.push({
      ...log,
      json: value,
      hex: hexToBytes(dec.hex),
    });
  });

  const syncs = mappedLogs.map(async log => {
    const baseProps: Prisma.PrintEventCreateInput = {
      stacksApiId: log.id,
      microblockCanonical: log.microblock_canonical,
      canonical: log.canonical,
      microblockSequence: log.microblock_sequence,
      contractId: log.contract_identifier,
      value: log.json,
      hex: Buffer.from(log.hex),
      topic: log.topic ?? '',
      txIndex: log.tx_index,
      eventIndex: log.event_index,
      blockHeight: log.block_height,
      indexBlockHash: log.index_block_hash,
      microblockHash: log.microblock_hash,
      txid: log.tx_id,
    };
    await prisma.printEvent.upsert({
      where: {
        blockHeight_microblockSequence_txIndex_eventIndex: {
          blockHeight: log.block_height,
          microblockSequence: log.microblock_sequence,
          txIndex: log.tx_index,
          eventIndex: log.event_index,
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
  stacksPrisma = new StacksPrisma();
  prisma = new PrismaClient();

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
