import type { BnsDbTypes, StacksDbTypes } from '@db';
import type { StacksDb, BnsDb } from '@db';
import { deserializeCV } from 'micro-stacks/clarity';
import { hexToBytes } from 'micro-stacks/common';
import { decodeClarityValue } from 'stacks-encoding-native-js';
import type { ContractLogs } from '~prisma';
import { cvToJSON } from '@clarigen/core';
import { logger } from '~/logger';
import { getDeployer } from '~/contracts';
import PQueue from 'p-queue';

type WhereInput = StacksDbTypes.ContractLogsWhereInput;

const log = logger.child({
  topic: 'sync-prints',
});

// For initial run - we start 12 blocks prior to the last sync.
// After the initial run, we paginate based on a "cursor" of our sync.
export async function syncPrints({
  bnsDb,
  stacksDb,
  lastLog,
  lookback = 12,
}: {
  bnsDb: BnsDb;
  stacksDb: StacksDb;
  lastLog?: ContractLogs;
  lookback?: number;
}) {
  let whereInput: WhereInput;
  if (typeof lastLog === 'undefined') {
    // first run
    const existing = await bnsDb.printEvent.findFirst({
      orderBy: {
        blockHeight: 'desc',
      },
    });
    const lastHeight = existing?.blockHeight ?? 0;
    const syncHeight = Math.max(lastHeight - lookback, 0);
    log.info({ lastHeight, syncHeight }, 'Starting log sync');
    whereInput = { block_height: { gte: syncHeight } };
  } else {
    // paginating
    const { block_height, microblock_sequence, tx_index, event_index } = lastLog;
    whereInput = {
      OR: [
        {
          block_height: { gt: block_height },
        },
        {
          block_height: block_height,
          microblock_sequence: { gt: microblock_sequence },
        },
        {
          block_height: block_height,
          microblock_sequence,
          tx_index: { gt: tx_index },
        },
        {
          block_height: block_height,
          microblock_sequence,
          tx_index,
          event_index: {
            gt: event_index,
          },
        },
      ],
    };
  }
  log.trace(
    {
      where: whereInput,
    },
    'fetching logs'
  );
  const logs = await stacksDb.contractLogs.findMany({
    where: {
      contract_identifier: {
        startsWith: getDeployer(),
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

  const lastSynced = await processLogs({ bnsDb, logs });
  if (typeof lastSynced === 'undefined') {
    log.info('Finished print syncs');
    // we are done
    return;
  }
  await syncPrints({ bnsDb, stacksDb, lastLog: lastSynced });
}

type MappedLog = ContractLogs & { json: BnsDbTypes.InputJsonValue; hex: Uint8Array };

const logQueue = new PQueue({ concurrency: 10 });

// Create or update "printEvent" table based on raw logs
async function processLogs({ bnsDb, logs }: { bnsDb: BnsDb; logs: ContractLogs[] }) {
  const mappedLogs: MappedLog[] = [];

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
    await logQueue.add(() => processLog(contractLog, bnsDb));
  });

  await Promise.all(syncs);
  return logs[logs.length - 1];
}

async function processLog(contractLog: MappedLog, bnsDb: BnsDb) {
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
  const existing = await bnsDb.printEvent.findFirst({
    where: {
      txid: contractLog.tx_id,
      eventIndex: contractLog.event_index,
      microblockSequence: contractLog.microblock_sequence,
      txIndex: contractLog.tx_index,
      blockHeight: contractLog.block_height,
    },
  });
  log.trace(
    {
      logBlockHeight: contractLog.block_height,
    },
    'Syncing log entry'
  );
  if (existing) {
    log.trace(
      {
        blockHeight: contractLog.block_height,
      },
      'Updating existing'
    );
    await bnsDb.printEvent.updateMany({
      where: {
        txid: contractLog.tx_id,
        eventIndex: contractLog.event_index,
        microblockSequence: contractLog.microblock_sequence,
        txIndex: contractLog.tx_index,
        blockHeight: contractLog.block_height,
      },
      data: {
        canonical: contractLog.canonical,
        microblockCanonical: contractLog.microblock_canonical,
      },
    });
  } else {
    log.trace(
      {
        print: contractLog.json,
      },
      'New contract log'
    );
    await bnsDb.printEvent.upsert({
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
  }
}
