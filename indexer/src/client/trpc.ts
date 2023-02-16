import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { DEFAULT_API_URL } from './constants';
import type { AppRouter } from '@routes/trpc';
export type { AppRouter } from '@routes/trpc';

export function trpcClient(baseUrl = DEFAULT_API_URL) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
      }),
    ],
  });
}

export type TrpcClient = ReturnType<typeof trpcClient>;
