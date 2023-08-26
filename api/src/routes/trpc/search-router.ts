import { router, procedure } from './base';
import { expectDb } from '@db/db-utils';
import { z } from 'zod';
import { convertDbName } from '~/contracts/utils';
import { parseFqn } from '@bns-x/core';
import { nameObjectToHex } from '~/utils';
import { TRPCError } from '@trpc/server';
import { fetchInscriptionOwner, inscriptionBuffToId } from '@fetchers/inscriptions';
import { hexToBytes, bytesToHex } from 'micro-stacks/common';

export const nameSearchResultSchema = z.object({
  name: z.string(),
});

export const searchRouter = router({
  searchNames: procedure
    .output(z.object({ results: z.array(nameSearchResultSchema) }))
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const names = await ctx.fetcher.searchNames(input.query);
      return {
        results: names.map(name => ({ name })),
      };
    }),
});
