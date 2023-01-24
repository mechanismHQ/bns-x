import {
  bnsContractState,
  clarigenAtom,
  readOnlyState,
  nameRegistryState,
  registryAssetState,
} from '.';
import { atom, Getter } from 'jotai';

import { atomFamilyWithQuery, atomWithQuery, useQueryAtom } from 'jotai-query-toolkit';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { convertNameBuff } from '../utils';
import { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import { NameExt, NameProperties, WithCombined } from '../types';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { cvToValue } from '@clarigen/core';
import { deserializeCV } from 'micro-stacks/clarity';
import { atomFamily } from 'jotai/utils';
import { namesForAddressState } from './api';

export const currentUserNamesState = atom(get => {
  const address = get(stxAddressAtom);
  if (!address) return null;
  return get(namesForAddressState(address));
});

export const v1NameAddressQueryState = atomFamily((address: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['v1NameState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      const bns = get(bnsContractState);
      const clarigen = get(clarigenAtom);
      bns.resolvePrincipal(address);
      const res = await clarigen.ro(bns.resolvePrincipal(address), {
        latest: true,
      });
      if (res.isOk) {
        return convertNameBuff(res.value);
      }
      return null;
    },
  }))[0];
}, Object.is);

export const currentUserV1NameState = atom(get => {
  const names = get(currentUserNamesState);
  return names?.legacy ?? null;
});

// export const currentUserV1NameState2 = atom(get => {
//   const address = get(stxAddressAtom);
//   if (!address) return null;
//   return get(v1NameAddressQueryState(address));
// });

export const addressPrimaryNameState = atomFamilyWithQuery<
  string,
  WithCombined<NameProperties> | null
>(
  (get, address) => ['addr-primary-name', address],
  async (get, address) => {
    const registry = get(nameRegistryState);
    const clarigen = get(clarigenAtom);
    const res = await clarigen.ro(registry.getPrimaryNameProperties(address));
    if (res) {
      return convertNameBuff(res);
    }
    return res;
  }
);

export const userPrimaryNameState = atom(get => {
  const names = get(currentUserNamesState);
  if (names === null) return null;
  return names.primaryProperties;
});

export const userNameState = atom(get => {
  const names = get(currentUserNamesState);
  return names?.names[0] ?? null;
});

export const nameByIdState = atomFamily((id: number | bigint) => {
  return atomsWithQuery(get => ({
    queryKey: ['name-by-id', id],
    queryFn: async () => {
      const clarigen = get(clarigenAtom);
      const registry = get(nameRegistryState);
      const props = await clarigen.ro(registry.getNamePropertiesById(id));
      if (props) return convertNameBuff(props);
      throw new Error(`Unable to find name by id ${id}`);
    },
  }))[0];
}, Object.is);

export const currentUserNameIdsState = atom<number[]>(get => {
  const names = get(currentUserNamesState);
  if (!names) return [];
  return names.nameProperties.map(n => parseInt(n.id, 10));
});

export const currentUserNameIdsState2 = atomsWithQuery<number[]>(get => ({
  queryKey: ['cur-user-names', get(stxAddressAtom)],
  refetchInterval: 10000,
  queryFn: async ctx => {
    const network = get(networkAtom);
    const urlBase = network.getCoreApiUrl();
    const addr = get(stxAddressAtom);
    const asset = get(registryAssetState);
    if (!addr) return [];
    const params = new URLSearchParams({
      principal: addr,
      unanchored: 'true',
      // asset_identifiers: asset,
    });
    const url = `${urlBase}/extended/v1/tokens/nft/holdings?${params}`;
    const res = await fetch(url);
    const data = (await res.json()) as NonFungibleTokenHoldingsList;
    return data.results
      .map(d => {
        const bign = cvToValue<bigint>(deserializeCV(d.value.hex));
        return Number(bign);
      })
      .filter(n => !Number.isNaN(n));
  },
}));
