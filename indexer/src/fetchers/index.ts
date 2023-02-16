import {
  getLegacyName,
  getNameDetails as getNameDetailsQuery,
  getNameOwnerQuery,
  getPrimaryName,
} from './query-helper';
import { getAddressNamesApi, getNameDetailsApi } from './stacks-api';
import type { NameInfoResponse, NamesByAddressResponse } from '../routes/api-types';
import type { BnsDb, StacksDb } from '@db';
import { getAddressNamesDb } from './stacks-db';
import { Histogram, Summary } from 'prom-client';
import type { PrismaClient } from '@prisma/client';
import { toUnicode } from 'punycode';
import { fetchBnsxDisplayName, fetchBnsxName, fetchBnsxNameOwner } from '@db/names';
import { convertNameBuff } from '~/contracts/utils';

export async function getNameDetails(
  name: string,
  namespace: string,
  db?: PrismaClient
): Promise<NameInfoResponse | null> {
  try {
    const [api, query, inscribedZf] = await Promise.all([
      getNameDetailsApi(name, namespace),
      db ? fetchBnsxName(name, namespace, db) : getNameDetailsQuery(name, namespace),
      db ? getInscribedZonefile(name, namespace, db) : Promise.resolve(null),
    ]);
    const zonefile = inscribedZf ? inscribedZf.zonefileRaw : api.zonefile;
    const inscriptionId = inscribedZf?.inscriptionId;
    const decoded = toUnicode(`${name}.${namespace}`);
    const inscriptionMeta = inscribedZf
      ? {
          blockHeight: inscribedZf.genesisHeight,
          txid: inscribedZf.genesisTransaction,
          timestamp: new Date(Number(inscribedZf.timestamp)).toISOString(),
          sat: inscribedZf.sat,
        }
      : undefined;
    const base = {
      ...api,
      zonefile,
      inscriptionId,
      inscription: inscriptionMeta,
      decoded,
    };
    if (query === null) {
      return {
        ...base,
        isBnsx: false,
      };
    }

    return {
      ...base,
      ...query,
      address: query.owner,
      isBnsx: true,
    };
  } catch (error) {
    console.warn(`Error fetching name details for ${name}.${namespace}:`, error);
    return null;
  }
}

export async function getInscribedZonefile(name: string, namespace: string, db: PrismaClient) {
  const zf = await db.inscriptionZonefiles.findFirst({
    where: {
      name,
      namespace,
    },
    orderBy: {
      timestamp: 'desc',
    },
  });
  return zf;
}

const getAddressNamesHist = new Histogram({
  name: 'fetch_address_names_seconds_hist',
  help: 'Histogram for how long it takes to fetch names owned by an address',
  labelNames: ['hasBnsx', 'hasLegacy'] as const,
});

const getAddressNamesSummary = new Summary({
  name: 'fetch_address_names_seconds_summary',
  help: 'Summary for how long it takes to fetch names owned by an address',
  labelNames: ['hasBnsx', 'hasLegacy'] as const,
  maxAgeSeconds: 600,
  ageBuckets: 5,
});

export async function getAddressNames(
  address: string,
  db?: StacksDb
): Promise<NamesByAddressResponse> {
  const end = getAddressNamesHist.startTimer();
  const endSum = getAddressNamesSummary.startTimer();
  const useDb = typeof db !== 'undefined' && process.env.USE_DB === '1';
  const names: NamesByAddressResponse = useDb
    ? await getAddressNamesDb(address, db)
    : await getAddressNamesApi(address);

  const labels = {
    hasBnsx: names.primaryProperties === null ? 'false' : 'true',
    hasLegacy: names.legacy === null ? 'false' : 'true',
  };
  end(labels);
  endSum(labels);
  return names;
}

export async function getDisplayName(address: string, db?: BnsDb) {
  if (typeof db !== 'undefined') {
    return fetchBnsxDisplayName(address, db);
  }
  const primary = await getPrimaryName(address);
  return primary ? convertNameBuff(primary).decoded : null;
}
