import { z } from 'zod';
import { nameStringsForAddressSchema } from '@bns-x/core';
import { router, procedure } from './base';

export const addressRouter = router({
  getAddressNameStrings: procedure
    .input(
      z.object({
        address: z.string().describe('A Stacks address to fetch names for'),
      })
    )
    .output(nameStringsForAddressSchema)
    .query(async ({ ctx, input }) => {
      return ctx.fetcher.getAddressNameStrings(input.address);
    }),
  getCoreName: procedure
    .input(
      z.object({
        address: z.string().describe('A Stacks address to fetch names for'),
      })
    )
    .output(z.nullable(z.string()))
    .query(async ({ ctx, input }) => {
      return ctx.fetcher.getCoreName(input.address);
    }),
});
