import { BnsApiClient } from '@bns-x/client';
import { getApiUrl } from '@common/constants';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';
import type { PrimitiveAtom } from 'jotai';
import { atom } from 'jotai';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@bns-x/api-types';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiUrl()}/trpc`,
    }),
  ],
});

export const bnsApi = new BnsApiClient(getApiUrl());

export const namesForAddressState = atomFamily((address: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['apiNamesState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      // return trpc.getAddressNames.query({ address });
      return bnsApi.getNamesOwnedByAddress(address);
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
  return atomsWithQuery(get => ({
    queryKey: displayNameQueryKey(address),
    refetchInterval: 15000,
    queryFn: async () => {
      console.log('fetching display name');
      return bnsApi.getDisplayName(address);
    },
  }))[0];
}, Object.is);

export type NostrName = Awaited<
  ReturnType<typeof trpc['zonefiles']['allNostr']['query']>
>['results'][number];

export const allNostrNamesState = atomsWithQuery<NostrName[]>(() => ({
  queryKey: ['all-nostr'],
  refetchInterval: false,
  queryFn: async () => {
    const all = await trpc.zonefiles.allNostr.query();
    return all.results;
  },
}))[0];
