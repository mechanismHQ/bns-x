import { BnsApiClient, getNameParts } from '@bns-x/client';
import { getApiUrl } from '@common/constants';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';
import type { PrimitiveAtom } from 'jotai';
import { atom } from 'jotai';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@bns-x/api-types';
import { fetchContractSource, fetchCoreApiInfo } from 'micro-stacks/api';
import { networkAtom } from '@store/micro-stacks';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiUrl()}/trpc`,
      maxURLLength: 2000,
    }),
  ],
});

export const bnsApi = new BnsApiClient(getApiUrl());

export const namesForAddressState = atomFamily((address: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['apiNamesState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      return trpc.getAddressNames.query({ address });
    },
  }))[0];
}, Object.is);

export const prefetchedDisplayNameState = atomFamily<string, PrimitiveAtom<string | null>>(
  (_address: string) => {
    return atom<string | null>(null);
  },
  Object.is
);

export function displayNameQueryKey(address: string) {
  return ['apiDisplayNameState', address];
}

export const addressDisplayNameState = atomFamily((address: string) => {
  return atomsWithQuery(_get => ({
    queryKey: displayNameQueryKey(address),
    refetchInterval: 15000,
    queryFn: async () => {
      const { name } = await trpc.getDisplayName.query(address);
      return name;
    },
  }))[0];
}, Object.is);

export type NostrName = Awaited<
  ReturnType<(typeof trpc)['zonefiles']['allNostr']['query']>
>['results'][number];

export const allNostrNamesState = atomsWithQuery<NostrName[]>(() => ({
  queryKey: ['all-nostr'],
  refetchInterval: false,
  queryFn: async () => {
    const all = await trpc.zonefiles.allNostr.query();
    return all.results;
  },
}))[0];

export const coreNodeInfoAtom = atomsWithQuery(get => ({
  queryKey: ['stacks-node-info'],
  async queryFn() {
    const network = get(networkAtom);
    const url = network.getCoreApiUrl();
    const info = await fetchCoreApiInfo({ url });
    return info;
  },
}))[0];

export const contractSrcState = atomFamily((contractId: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['contract-src', contractId],
    async queryFn() {
      const network = get(networkAtom);
      const url = network.getCoreApiUrl();
      const [contractAddr, contractName] = getNameParts(contractId);
      const src = await fetchContractSource({
        url,
        contract_address: contractAddr,
        contract_name: contractName,
        tip: 'latest',
        proof: 0,
      });
      if (!src?.source) {
        throw new Error('Unable to fetch contract source');
      }
      return src.source;
    },
  }))[0];
});

export const searchInputAtom = atom('');

export const searchResultsAtom = atomsWithQuery<{ name: string }[]>(get => ({
  queryKey: ['search', get(searchInputAtom)],
  queryFn: async () => {
    const query = get(searchInputAtom);
    if (query === '') return [];
    const { results } = await trpc.searchRouter.searchNames.query({ query });
    return results;
  },
}))[0];
