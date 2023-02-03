import { StacksPrisma } from '../src/stacks-api-db/client';
import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { deserializeCV, cvToTrueValue } from 'micro-stacks/clarity';
import { bytesToHex } from 'micro-stacks/common';
import { decodeClarityValue } from 'stacks-encoding-native-js';
import type { ContractLogs } from '../prisma/generated/stacks-api-schema';
import { cvToJSON } from '@clarigen/core';

let prisma: PrismaClient;
let stacksPrisma: StacksPrisma;

async function getLogs() {
  const existing = await prisma.printEvent.findFirst({
    orderBy: {
      blockHeight: 'desc',
    },
  });
  const lastHeight = existing?.blockHeight ?? 0;
  const syncHeight = Math.max(lastHeight - 12, 0);
  const logs = await stacksPrisma.contractLogs.findMany({
    where: {
      contract_identifier: {
        startsWith: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      },
      block_height: {
        gte: syncHeight,
      },
    },
    orderBy: {
      id: 'asc',
    },
    take: 100,
  });

  const mappedLogs: (ContractLogs & { json: any })[] = [];

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
      hex: bytesToHex(log.value),
      topic: log?.topic ?? '',
      txIndex: log.tx_index,
      eventIndex: log.event_index,
      blockHeight: log.block_height,
      indexBlockHash: bytesToHex(log.index_block_hash),
      microblockHash: bytesToHex(log.microblock_hash),
      txid: bytesToHex(log.tx_id),
    };
    await prisma.printEvent.upsert({
      where: {
        stacksApiId: log.id,
      },
      create: baseProps,
      update: {
        ...baseProps,
      },
    });
  });

  // prisma.printEvent.

  await Promise.all(syncs);
}

async function run() {
  stacksPrisma = new StacksPrisma();
  prisma = new PrismaClient();

  await Promise.all([prisma.$connect(), stacksPrisma.$connect()]);

  await getLogs();
}

run()
  .catch(console.error)
  .finally(async () => {
    await Promise.all([await prisma.$disconnect(), await stacksPrisma.$disconnect()]);
    process.exit();
  });
