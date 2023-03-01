import { fetchBnsxDisplayName, fetchBnsxName } from '@db/names';
import type { BnsDb, StacksDb } from '@db';
import {
  fetchCoreName,
  fetchLegacyDisplayName,
  getAddressNamesApi,
  getNameDetailsApi,
  getNameDetailsFqnApi,
} from '@fetchers/stacks-api';
import type { NameInfoResponse, NamesByAddressResponse } from '@bns-x/core';
import { getNameParts } from '@bns-x/core';
import { parseFqn } from '~/utils';
import type { BaseFetcher } from './base';
import { toUnicode } from 'punycode';
import { getZonefileProperties } from '@fetchers/zonefile';
import { fetchNamesByAddress } from 'micro-stacks/api';
import { getNodeUrl } from '~/constants';
import { convertNameBuff } from '~/contracts/utils';

export class DbFetcher implements BaseFetcher {
  bnsDb: BnsDb;
  stacksDb: StacksDb;

  constructor(bnsDb: BnsDb, stacksDb: StacksDb) {
    this.bnsDb = bnsDb;
    this.stacksDb = stacksDb;
  }

  async getDisplayName(address: string): Promise<string | null> {
    const [legacyName, bnsxName] = await Promise.all([
      fetchLegacyDisplayName(address),
      fetchBnsxDisplayName(address, this.bnsDb),
    ]);
    return legacyName ?? bnsxName;
  }

  async getNameDetails(fqn: string): Promise<NameInfoResponse | null> {
    const { subdomain, name, namespace } = parseFqn(fqn);
    try {
      const [api, query, inscribedZf] = await Promise.all([
        getNameDetailsApi(name, namespace),
        subdomain ? Promise.resolve(null) : fetchBnsxName(name, namespace, this.bnsDb),
        this.getInscribedZonefile(name, namespace),
      ]);
      if ('error' in api) {
        return null;
      }
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
        zonefile: zonefile ?? '',
        inscriptionId,
        inscription: inscriptionMeta,
        decoded,
      };
      const zonefileRecords = getZonefileProperties(zonefile);
      if (query === null) {
        return {
          ...base,
          isBnsx: false,
          zonefileRecords,
        };
      }

      return {
        ...base,
        ...query,
        address: query.owner,
        isBnsx: true,
        zonefileRecords,
        wrapper: api.address,
      };
    } catch (error) {
      console.warn(`Error fetching name details for ${name}.${namespace}:`, error);
      return null;
    }
  }

  async getAddressNames(address: string): Promise<NamesByAddressResponse> {
    const [owned, primaryNameRow, coreName] = await Promise.all([
      this.bnsDb.nameOwnership.findMany({
        include: {
          name: true,
        },
        where: {
          account: address,
        },
      }),
      this.bnsDb.primaryName.findFirst({
        where: {
          account: address,
        },
      }),
      fetchCoreName(address),
    ]);
    const primaryId = primaryNameRow?.primaryId ?? null;

    const bnsxNames: NamesByAddressResponse['nameProperties'][number][] = [];

    owned.forEach(n => {
      if (n.name === null) return;
      const converted = convertNameBuff({
        ...n.name,
        id: Number(n.name.id),
      });
      bnsxNames.push(converted);
    });
    const primaryName =
      bnsxNames.find(n => {
        return n.id === Number(primaryId);
      }) ?? null;

    // Handle when Stacks API is "behind"
    const showCore = bnsxNames.findIndex(n => n.combined === coreName) === -1;

    const nameStrings: string[] = [];
    if (showCore && coreName) {
      nameStrings.push(coreName);
    }
    nameStrings.push(...bnsxNames.map(n => n.combined));

    const coreDetailsRes = coreName && showCore ? await getNameDetailsFqnApi(coreName) : null;

    let coreDetails: NamesByAddressResponse['coreName'] = null;

    if (coreDetailsRes && coreName) {
      const [name, namespace] = getNameParts(coreName);
      coreDetails = {
        name: name,
        namespace: namespace,
        leaseEndingAt: coreDetailsRes.expire_block ?? null,
        leaseStartedAt: undefined,
        combined: coreName,
        decoded: toUnicode(coreName),
        zonefileHash: coreDetailsRes.zonefile_hash ?? '',
        owner: address,
      };
    }

    // return names;

    return {
      primaryName: primaryName?.combined ?? null,
      primaryProperties: primaryName,
      nameProperties: bnsxNames,
      displayName: coreName ?? primaryName?.combined ?? null,
      names: nameStrings,
      coreName: coreDetails,
    };
  }

  async getInscribedZonefile(name: string, namespace: string) {
    const zf = await this.bnsDb.inscriptionZonefiles.findFirst({
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
}
