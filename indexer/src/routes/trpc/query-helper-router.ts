import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getNameDetails, getAddressNames, getDisplayName } from '../../fetchers';
import { displayNameResponseSchema, namesByAddressBnsxSchema } from '../api-types';
import { router, procedure } from './base';

export const queryHelperRouter = router({
  getAddressNames: procedure
    .input(z.string())
    .output(namesByAddressBnsxSchema)
    .query(async ({ ctx, input }) => {
      return await getAddressNames(input, ctx.prisma);
    }),

  getNameDetails: procedure
    .input(
      z.object({
        name: z.string(),
        namespace: z.string(),
      })
    )
    .query(async ({ ctx, input: { name, namespace } }) => {
      const details = await getNameDetails(name, namespace, ctx.bnsxDb);
      if (details === null) {
        throw new TRPCError({
          message: `Unable to fetch details for ${name}.${namespace}`,
          code: 'NOT_FOUND',
        });
      }
      return details;
    }),

  getDisplayName: procedure
    .input(z.string())
    .output(displayNameResponseSchema)
    .query(async ({ input, ctx }) => {
      const displayName = await getDisplayName(input, ctx.bnsxDb);
      return {
        name: displayName,
      };
    }),
});

export type QueryHelperRouter = typeof queryHelperRouter;
