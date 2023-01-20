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

export const v1NameAddressQueryState = atomFamilyWithQuery<string, NameExt | null>(
  (get, address) => ['v1NameState', address],
  async (get, address) => {
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
  }
);

export const v1NameAddressQueryState2 = atomFamily((address: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['v1NameState', address],
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
  const address = get(stxAddressAtom);
  if (!address) return null;
  return get(v1NameAddressQueryState2(address));
});

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
  const address = get(stxAddressAtom);
  if (!address) return null;
  const name = get(addressPrimaryNameState(address));
  return name;
});

export const userNameState = atom(get => {
  const address = get(stxAddressAtom);
  if (!address) return null;
  const primary = get(userPrimaryNameState);
  if (primary) return primary.combined;
  const v1 = get(currentUserV1NameState);
  if (v1) return v1.combined;
  return null;
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

export const currentUserNameIdsState = atomsWithQuery<number[]>(get => ({
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
