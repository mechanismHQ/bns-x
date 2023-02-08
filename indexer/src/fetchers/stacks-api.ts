import { fetch } from 'cross-fetch';
import { getNetwork, getNodeUrl } from '../constants';
import { fetchName, fetchNamesByAddress, fetchContractDataMapEntry } from 'micro-stacks/api';
import type { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { cvToValue, fetchMapGet } from '@clarigen/core';
import {
  clarigenProvider,
  getContracts,
  registryContract,
  registryContractAsset,
} from '../contracts';
import { deserializeCV } from 'micro-stacks/clarity';
import { convertNameBuff, convertLegacyDetailsJson } from '../contracts/utils';
import type { NamesByAddressResponse } from '../routes/api-types';
import type { NamePropertiesJson } from '../contracts/types';
import { getLegacyName } from './query-helper';

export async function getNameDetailsApi(name: string, namespace: string) {
  const fqn = `${name}.${namespace}`;
  const res = await fetchName({ url: getNodeUrl(), name: fqn });

  return res;
}

export async function getAssetIds(address: string): Promise<number[]> {
  const urlBase = getNodeUrl();
  const params = new URLSearchParams({
    principal: address,
    unanchored: 'true',
    asset_identifiers: registryContractAsset(),
  });
  const url = `${urlBase}/extended/v1/tokens/nft/holdings?${params.toString()}`;
  const res = await fetch(url);
  const data = (await res.json()) as NonFungibleTokenHoldingsList;
  return data.results
    .map(d => {
      const bign = cvToValue<bigint>(deserializeCV(d.value.hex));
      return Number(bign);
    })
    .filter(n => !Number.isNaN(n));
}

export async function fetchPrimaryId(address: string): Promise<number | null> {
  const registry = registryContract();
  const network = getNetwork();
  const idOpt = await fetchMapGet(registry.identifier, registry.maps.ownerPrimaryNameMap, address, {
    network,
  });
  if (idOpt === null) return null;
  return Number(idOpt);
}

export async function getAddressNamesApi(address: string): Promise<NamesByAddressResponse> {
  const [_legacy, assetIds, primaryId, legacyStrings] = await Promise.all([
    getLegacyName(address),
    getAssetIds(address),
    fetchPrimaryId(address),
    fetchNamesByAddress({
      url: getNodeUrl(),
      blockchain: 'stacks',
      address: address,
    }),
  ]);
  const clarigen = clarigenProvider();
  const registry = registryContract();

  const names = (
    await Promise.all(
      assetIds.map(async id => {
        const name = await clarigen.ro(registry.getNamePropertiesById(id), {
          json: true,
        });
        return name;
      })
    )
  )
    .filter((n): n is NamePropertiesJson => n !== null)
    .map(n => ({
      ...convertNameBuff(n),
      id: parseInt(n.id, 10),
    }));
  const legacy = _legacy === null ? null : convertLegacyDetailsJson(convertNameBuff(_legacy));

  const nameStrings = names.map(n => n.combined);
  if (legacy !== null) {
    nameStrings.push(legacy.combined);
  }
  const displayName = nameStrings[0] ?? null;

  const primaryProperties = names.find(n => n.id === primaryId) ?? null;

  if ('names' in legacyStrings && nameStrings.length === 0) {
    nameStrings.push(...legacyStrings.names);
  }

  return {
    legacy,
    names: nameStrings,
    nameProperties: names,
    primaryProperties,
    displayName,
    primaryName: primaryProperties?.combined ?? null,
  };
}
