import type { AppRouter } from '@bns-x/api-server';
import { createTRPCReact } from '@trpc/react-query';
import { httpLink, httpBatchLink } from '@trpc/client';
import { createTRPCJotai } from 'jotai-trpc';
import { getApiUrl, getAppUrl } from '@common/constants';
import { stxAddressAtom } from '@store/micro-stacks';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { createTRPCProxyClient } from '@trpc/client';
import { atomFamily } from 'jotai/utils';
import { atom } from 'jotai';

// export const trpcReact = createTRPCReact<AppRouter>();
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiUrl()}/trpc`,
    }),
  ],
});

export const namesForAddressState = atomFamily((address: string) => {
  return atomsWithQuery(get => ({
    queryKey: ['apiNamesState', address],
    refetchInterval: 15000,
    queryFn: async () => {
      return trpc.getAddressNames.query(address);
    },
  }))[0];
}, Object.is);
