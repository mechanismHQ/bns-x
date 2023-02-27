import type { CreateTRPCProxyClient } from '@trpc/client';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { DEFAULT_API_URL } from './constants';
import type { AppRouter } from '@bns-x/api-types';

export function trpcClient(baseUrl = DEFAULT_API_URL): CreateTRPCProxyClient<AppRouter> {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
      }),
    ],
  });
}

export type TrpcClient = ReturnType<typeof trpcClient>;
