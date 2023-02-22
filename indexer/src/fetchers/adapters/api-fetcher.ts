import {
  fetchLegacyDisplayName,
  getAddressNamesApi,
  getNameDetailsApi,
} from '@fetchers/stacks-api';
import type { NameInfoResponse, NamesByAddressResponse } from '@routes/api-types';
import { parseFqn } from '~/utils';
import type { BaseFetcher } from './base';
import { getNameDetails as getNameDetailsQuery, getPrimaryName } from '~/fetchers/query-helper';
import { toUnicode } from 'punycode';
import { getZonefileProperties } from '@fetchers/zonefile';
import { convertNameBuff } from '~/contracts/utils';

export class ApiFetcher implements BaseFetcher {
  async getDisplayName(address: string): Promise<string | null> {
    const [bnsxName, legacyName] = await Promise.all([
      fetchLegacyDisplayName(address),
      (async () => {
        const primary = await getPrimaryName(address);
        return primary ? convertNameBuff(primary).decoded : null;
      })(),
    ]);
    return bnsxName ?? legacyName;
  }

  async getNameDetails(fqn: string): Promise<NameInfoResponse | null> {
    const { subdomain, name, namespace } = parseFqn(fqn);
    try {
      const [api, query] = await Promise.all([
        getNameDetailsApi(name, namespace),
        subdomain ? Promise.resolve(null) : getNameDetailsQuery(name, namespace),
      ]);
      const decoded = toUnicode(`${name}.${namespace}`);
      const base = {
        ...api,
        decoded,
      };
      const zonefileRecords = getZonefileProperties(api.zonefile);
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
      console.warn(`Error fetching name details for ${fqn}:`, error);
      return null;
    }
  }

  async getAddressNames(address: string): Promise<NamesByAddressResponse> {
    const names: NamesByAddressResponse = await getAddressNamesApi(address);
    return names;
  }
}
