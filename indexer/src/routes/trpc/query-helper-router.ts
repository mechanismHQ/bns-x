import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { displayNameResponseSchema, namesByAddressBnsxSchema } from '../api-types';
import { router, procedure } from './base';

export const queryHelperRouter = router({
  getAddressNames: procedure
    .input(
      z.object({
        address: z.string().describe('A Stacks address to fetch names for'),
      })
    )
    .meta({
      openapi: {
        method: 'GET',
        path: '/get-address-names',
        tags: ['bns', 'trpc'],
      },
    })
    .output(namesByAddressBnsxSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.fetcher.getAddressNames(input.address);
    }),

  getNameDetails: procedure
    .input(
      z.union([
        z.object({
          name: z.string(),
          namespace: z.string(),
        }),
        z.object({
          fqn: z.string(),
        }),
      ])
    )
    .query(async ({ ctx, input }) => {
      let fqn: string;
      if ('fqn' in input) {
        fqn = input.fqn;
      } else {
        fqn = `${input.name}.${input.namespace}`;
      }
      const details = await ctx.fetcher.getNameDetails(fqn);
      if (details === null) {
        throw new TRPCError({
          message: `Unable to fetch details for ${fqn}`,
          code: 'NOT_FOUND',
        });
      }
      return details;
    }),

  getDisplayName: procedure
    .input(z.string())
    .output(displayNameResponseSchema)
    .query(async ({ input, ctx }) => {
      const displayName = await ctx.fetcher.getDisplayName(input);
      return {
        name: displayName,
      };
    }),
});

export type QueryHelperRouter = typeof queryHelperRouter;
