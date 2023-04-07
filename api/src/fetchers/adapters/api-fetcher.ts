import { getAddressNamesApi, getNameDetailsApi, fetchCoreName } from '@fetchers/stacks-api';
import type { NameInfoResponse, NamesByAddressResponse } from '@bns-x/core';
import { parseFqn } from '~/utils';
import type { BaseFetcher } from './base';
import { getNameDetails as getNameDetailsQuery, getPrimaryName } from '~/fetchers/query-helper';
import { toUnicode } from '@bns-x/punycode';
import { getZonefileProperties } from '@fetchers/zonefile';
import { convertNameBuff } from '~/contracts/utils';
import { logger } from '~/logger';

export class ApiFetcher implements BaseFetcher {
  async getDisplayName(address: string): Promise<string | null> {
    const [legacyName, bnsxName] = await Promise.all([
      fetchCoreName(address),
      (async () => {
        const primary = await getPrimaryName(address);
        return primary ? convertNameBuff(primary).decoded : null;
      })(),
    ]);
    return legacyName ?? bnsxName;
  }

  async getNameDetails(fqn: string): Promise<NameInfoResponse | null> {
    const { subdomain, name, namespace } = parseFqn(fqn);
    try {
      const [api, query] = await Promise.all([
        getNameDetailsApi(name, namespace),
        subdomain ? Promise.resolve(null) : getNameDetailsQuery(name, namespace),
      ]);
      if ('error' in api) {
        return null;
      }
      const decoded = toUnicode(`${name}.${namespace}`);
      const base = {
        ...api,
        zonefile: api.zonefile ?? '',
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
        wrapper: api.address,
        isBnsx: true,
        zonefileRecords,
      };
    } catch (error) {
      logger.error({ fqn }, 'Error fetching name details');
      return null;
    }
  }

  async getAddressNames(address: string): Promise<NamesByAddressResponse> {
    const names: NamesByAddressResponse = await getAddressNamesApi(address);
    return names;
  }
}
