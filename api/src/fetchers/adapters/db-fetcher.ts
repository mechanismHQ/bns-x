import { fetchBnsxDisplayName, fetchBnsxName, fetchBnsxNamesByAddressRows } from '@db/names';
import type { BnsDb, StacksDb, BnsDbTypes } from '@db';
import { fetchCoreName, getNameDetailsApi, getNameDetailsFqnApi } from '@fetchers/stacks-api';
import type {
  NameInfoResponse,
  NameStringsForAddressResponse,
  NamesByAddressResponse,
} from '@bns-x/core';
import { getNameParts } from '@bns-x/core';
import { parseFqn } from '~/utils';
import type { BaseFetcher } from './base';
import { toUnicode } from '@bns-x/punycode';
import { getZonefileProperties } from '@fetchers/zonefile';
import { convertDbName, convertNameBuff } from '~/contracts/utils';
import { logger } from '~/logger';
import { fetchCoreNameByAddress } from '@db/bns-core';
import { DbQueryTag, observeQuery } from '~/metrics';
import { c32addressDecode } from 'micro-stacks/crypto';
import { searchNamesFuzzy } from '@fetchers/search';
import { inscriptionBuffToId } from '@fetchers/inscriptions';
import { bytesToHex, hexToBytes } from 'micro-stacks/common';

export class DbFetcher implements BaseFetcher {
  bnsDb: BnsDb;
  stacksDb: StacksDb;

  constructor(bnsDb: BnsDb, stacksDb: StacksDb) {
    this.bnsDb = bnsDb;
    this.stacksDb = stacksDb;
  }

  static isDb(fetcher: BaseFetcher): fetcher is DbFetcher {
    return 'bnsDb' in fetcher;
  }

  async getDisplayName(address: string): Promise<string | null> {
    const [legacyName, bnsxName] = await Promise.all([
      this.getCoreName(address),
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
      const decoded = toUnicode(`${name}.${namespace}`);
      const base = {
        ...api,
        zonefile: api.zonefile ?? '',
        decoded,
      };
      const zonefileRecords = getZonefileProperties(base.zonefile);
      if (query === null) {
        return {
          ...base,
          isBnsx: false,
          zonefileRecords,
        };
      }

      const inscriptionId = inscribedZf?.inscriptionId;
      const inscriptionMeta = inscribedZf
        ? {
            blockHeight: inscribedZf.genesisHeight,
            txid: inscribedZf.genesisTransaction,
            timestamp: new Date(Number(inscribedZf.timestamp)).toISOString(),
            sat: inscribedZf.sat,
          }
        : undefined;
      const zonefile = inscribedZf ? inscribedZf.zonefileRaw : base.zonefile;

      return {
        ...base,
        ...query,
        zonefile,
        address: query.owner,
        inscription: inscriptionMeta,
        inscriptionId,
        isBnsx: true,
        zonefileRecords,
        wrapper: api.address,
      };
    } catch (error) {
      logger.error(
        { name, namespace, err: error },
        `Error fetching name details for ${name}.${namespace}`
      );
      return null;
    }
  }

  async getAddressNames(address: string): Promise<NamesByAddressResponse> {
    const [owned, primaryNameRow, coreName] = await Promise.all([
      fetchBnsxNamesByAddressRows(address, this.bnsDb),
      this.getPrimaryNameId(address),
      this.getCoreName(address),
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

  async getAddressNameStrings(address: string): Promise<NameStringsForAddressResponse> {
    const [coreName, bnsxNameRows] = await Promise.all([
      this.getCoreName(address),
      fetchBnsxNamesByAddressRows(address, this.bnsDb),
    ]);
    const bnsxNames = bnsxNameRows.map(n => {
      const converted = convertNameBuff({
        ...n.name!,
        id: Number(n.name!.id),
      });
      return {
        name: converted.combined,
        id: converted.id,
      };
    });
    return { coreName, bnsxNames };
  }

  async getPrimaryNameId(address: string) {
    const done = observeQuery(DbQueryTag.BNSX_PRIMARY_NAME_ID);
    const rows = await this.bnsDb.primaryName.findUnique({
      where: {
        account: address,
      },
    });
    done();
    return rows;
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

  async fetchBnsxNames(): Promise<NamesByAddressResponse['nameProperties'][number][]> {
    const names = (
      await this.bnsDb.name.findMany({
        orderBy: {
          id: 'desc',
        },
        take: 100,
      })
    ).map(convertDbName);

    return names;
  }

  async getCoreName(address: string): Promise<string | null> {
    return fetchCoreNameByAddress(this.stacksDb, address);
  }

  async getNameExists(fqn: string) {
    const result = await this.stacksDb.names.findFirst({
      where: {
        name: fqn,
        status: {
          not: 'name-revoke',
        },
        canonical: true,
        microblock_canonical: true,
      },
    });

    return result !== null;
  }

  async searchNames(query: string) {
    try {
      // check for address
      c32addressDecode(query);
      const { coreName, bnsxNames } = await this.getAddressNameStrings(query);
      const results: string[] = [];
      if (coreName !== null) results.push(coreName);
      results.push(...bnsxNames.map(n => n.name));
      return results;
    } catch (error) {
      const results = await searchNamesFuzzy({ query, db: this.stacksDb });
      return results;
    }
  }

  async fetchInscribedNames(cursor?: number) {
    const rows = await this.bnsDb.inscribedNames.findMany({
      include: {
        name: true,
      },
      orderBy: {
        id: 'desc',
      },
      cursor:
        typeof cursor === 'undefined'
          ? undefined
          : {
              id: cursor,
            },
      take: -100,
      skip: typeof cursor === 'undefined' ? undefined : 1,
    });
    return rows
      .map(row => {
        if (row.name === null) return null;

        const name = convertDbName(row.name);

        return {
          inscriptionId: inscriptionBuffToId(hexToBytes(row.inscription_id)),
          id: Number(row.id),
          name: name.combined,
          blockHeight: row.blockHeight,
          txid: bytesToHex(row.txid),
        };
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);
  }

  async fetchTotalInscribedNames() {
    const total = await this.bnsDb.inscribedNames.count();
    return total;
  }
}
