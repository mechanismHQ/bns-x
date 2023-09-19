import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  displayNameResponseSchema,
  nameDetailsSchema,
  namesByAddressBnsxSchema,
} from '@bns-x/core';
import { router, procedure } from './base';
import { toPunycode } from '@bns-x/punycode';

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
        tags: ['Backwards Compatible', 'trpc'],
        summary: 'Get all names owned by an address',
        description: `
Fetch all names owned by an address. If you only need to show a single name
for the address, use the "fetch name owned by an address" endpoint for better performance.

[example with BNSx](https://api.bns.xyz/bns/addresses/stacks/SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60) [example without BNSx](https://api.bns.xyz/bns/addresses/stacks/SP132QXWFJ11WWXPW4JBTM9FP6XE8MZWB8AF206FX)

The logic for determining name order in the \`names\` property is:

- If they own a BNS core name, return that first
- If they have a BNS subdomain, return that
- If they don't own a BNS core name, but they own a BNSx name, return that
        `,
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
    .output(nameDetailsSchema)
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

  getNameExists: procedure
    .input(z.string())
    .output(z.boolean())
    .query(async ({ input, ctx }) => {
      const puny = toPunycode(input);
      return ctx.fetcher.getNameExists(puny);
    }),
});

export type QueryHelperRouter = typeof queryHelperRouter;
