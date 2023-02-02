import { clarigenAtom, nameRegistryState, registryAssetState } from '.';
import { atom } from 'jotai';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { convertNameBuff } from '../utils';
import type { NonFungibleTokenHoldingsList } from '@stacks/stacks-blockchain-api-types';
import type { NameProperties, WithCombined } from '../types';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { cvToValue } from '@clarigen/core';
import { deserializeCV } from 'micro-stacks/clarity';
import { atomFamily } from 'jotai/utils';
import { namesForAddressState } from './api';
import { makeNameWrapper } from '@common/wrapper';
import isEqual from 'lodash-es/isEqual';

export const currentUserNamesState = atom(get => {
  const address = get(stxAddressAtom);
  if (!address) return null;
  return get(namesForAddressState(address));
});

export const currentUserV1NameState = atom(get => {
  const names = get(currentUserNamesState);
  return names?.legacy ?? null;
});

export const addressPrimaryNameState2 = atomFamily((address: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['addr-primary-name', address],
    async queryFn() {
      const registry = get(nameRegistryState);
      const clarigen = get(clarigenAtom);
      const res = await clarigen.ro(registry.getPrimaryNameProperties(address));
      if (res) {
        return convertNameBuff(res);
      }
      return res;
    },
  }))[0];
}, isEqual);

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
  return names.nameProperties.map(n => n.id);
});

export const currentUserNameIdsState2 = atomsWithQuery<number[]>(get => ({
  queryKey: ['cur-user-names', get(stxAddressAtom)],
  refetchInterval: 10000,
  queryFn: async () => {
    const network = get(networkAtom);
    const urlBase = network.getCoreApiUrl();
    const addr = get(stxAddressAtom);
    if (!addr) return [];
    const params = new URLSearchParams({
      principal: addr,
      unanchored: 'true',
      // asset_identifiers: asset,
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
  },
}));
