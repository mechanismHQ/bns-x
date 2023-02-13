import { trpcClient } from '@bns-x/client';
import { getApiUrl } from '@common/constants';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';
import type { PrimitiveAtom } from 'jotai';
import { atom } from 'jotai';

export const trpc = trpcClient(getApiUrl());

export const namesForAddressState = atomFamily((address: string) => {
  return atomsWithQuery(() => ({
    queryKey: ['apiNamesState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      return trpc.getAddressNames.query(address);
    },
  }))[0];
}, Object.is);

export const prefetchedDisplayNameState = atomFamily<string, PrimitiveAtom<string | null>>(
  (_address: string) => {
    return atom<string | null>(null);
  },
  Object.is
);

export const addressDisplayNameState = atomFamily((address: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['apiDisplayNameState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      const prefetched = get(prefetchedDisplayNameState(address));
      if (prefetched) return prefetched;
      const { name } = await trpc.getDisplayName.query(address);
      return name;
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
