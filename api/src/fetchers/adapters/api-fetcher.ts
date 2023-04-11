import {
  getAddressNamesApi,
  getNameDetailsApi,
  fetchCoreName,
  getAssetIds,
} from '@fetchers/stacks-api';
import type {
  NameInfoResponse,
  NamePropertiesJson,
  NameStringsForAddressResponse,
  NamesByAddressResponse,
} from '@bns-x/core';
import { parseFqn } from '~/utils';
import type { BaseFetcher } from './base';
import { getNameDetails as getNameDetailsQuery, getPrimaryName } from '~/fetchers/query-helper';
import { toUnicode } from '@bns-x/punycode';
import { getZonefileProperties } from '@fetchers/zonefile';
import { convertNameBuff } from '~/contracts/utils';
import { logger } from '~/logger';
import { clarigenProvider, registryContract } from '~/contracts';

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

  async getAddressNameStrings(address: string): Promise<NameStringsForAddressResponse> {
    const [assetIds, coreName] = await Promise.all([getAssetIds(address), fetchCoreName(address)]);

    const clarigen = clarigenProvider();
    const registry = registryContract();

    const names = (
      await Promise.all(
        assetIds.map(async id => {
          const name = await clarigen.ro(registry.getNamePropertiesById(id), {
            json: true,
            tip: 'latest',
          });
          return name;
        })
      )
    )
      .filter((n): n is NamePropertiesJson => n !== null)
      .map(n => ({
        name: convertNameBuff(n).combined,
        id: parseInt(n.id, 10),
      }));

    return {
      coreName,
      bnsxNames: names,
    };
  }

  async getCoreName(address: string): Promise<string | null> {
    return fetchCoreName(address);
  }
}
