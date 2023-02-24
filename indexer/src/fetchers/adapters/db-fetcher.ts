import { fetchBnsxDisplayName, fetchBnsxName } from '@db/names';
import type { BnsDb, StacksDb } from '@db';
import {
  fetchLegacyDisplayName,
  getAddressNamesApi,
  getNameDetailsApi,
} from '@fetchers/stacks-api';
import type { NameInfoResponse, NamesByAddressResponse } from '@routes/api-types';
import { parseFqn } from '~/utils';
import type { BaseFetcher } from './base';
import { toUnicode } from 'punycode';
import { getZonefileProperties } from '@fetchers/zonefile';

export class DbFetcher implements BaseFetcher {
  bnsDb: BnsDb;
  stacksDb: StacksDb;

  constructor(bnsDb: BnsDb, stacksDb: StacksDb) {
    this.bnsDb = bnsDb;
    this.stacksDb = stacksDb;
  }

  async getDisplayName(address: string): Promise<string | null> {
    const [bnsxName, legacyName] = await Promise.all([
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
      };
    } catch (error) {
      console.warn(`Error fetching name details for ${name}.${namespace}:`, error);
      return null;
    }
  }

  async getAddressNames(address: string): Promise<NamesByAddressResponse> {
    const names: NamesByAddressResponse = await getAddressNamesApi(address);
    return names;
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
