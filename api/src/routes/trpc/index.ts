import { zonefileRouter } from '@routes/trpc/zonefile-router';
import { mergeRouters, router } from './base';
import { inscriptionRouter } from './inscription-router';
import { queryHelperRouter } from './query-helper-router';
import type { AnyRootConfig } from '@trpc/server';

export const appRouter = mergeRouters(
  queryHelperRouter,
  router({
    inscriptions: inscriptionRouter,
    zonefiles: zonefileRouter,
  })
);

export type AppRouter = typeof appRouter;
