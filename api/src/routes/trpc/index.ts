import { zonefileRouter } from '@routes/trpc/zonefile-router';
import { mergeRouters, router } from './base';
import { inscriptionRouter } from './inscription-router';
import { queryHelperRouter } from './query-helper-router';
import { addressRouter } from '@routes/trpc/address-router';

export const appRouter = mergeRouters(
  queryHelperRouter,
  addressRouter,
  router({
    inscriptions: inscriptionRouter,
    zonefiles: zonefileRouter,
  })
);

export type AppRouter = typeof appRouter;
