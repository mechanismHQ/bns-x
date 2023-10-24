import { toUnicode } from '@bns-x/punycode';
import { router, procedure } from './base';
import { expectDb } from '@db/db-utils';
import { z } from 'zod';
import { convertDbName } from '~/contracts/utils';
import { parseFqn } from '@bns-x/core';
import { nameObjectToHex } from '~/utils';
import { TRPCError } from '@trpc/server';
import { fetchInscriptionOwner, inscriptionBuffToId } from '@fetchers/inscriptions';
import { hexToBytes, bytesToHex } from 'micro-stacks/common';
import { DbFetcher } from '@fetchers/adapters/db-fetcher';

const inscribedNameResult = z.object({
  inscriptionId: z.string(),
  id: z.number(),
  name: z.string(),
  blockHeight: z.number(),
  txid: z.string(),
});

export const inscriptionByNameResult = z.object({
  inscriptionId: z.string(),
  owner: z.string(),
});

export const nameByInscriptionResult = z.object({
  name: z.nullable(z.string()),
});

export const inscribedNamesResultsSchema = z.object({
  total: z.number(),
  results: z.array(inscribedNameResult),
});

export const inscribedNamesOptionsSchema = z.object({
  cursor: z
    .optional(z.number())
    .describe('Optionally, an ID to fetch results after. Use this to paginate results'),
});

export const bridgeRouter = router({
  inscribedNames: procedure
    .input(inscribedNamesOptionsSchema)
    .output(inscribedNamesResultsSchema)
    .query(async ({ ctx, input }) => {
      expectDb(ctx.prisma);
      expectDb(ctx.bnsxDb);
      const { fetcher } = ctx;
      if (!DbFetcher.isDb(fetcher)) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Fetcher is not a DbFetcher',
        });
      }
      const [inscribedNames, total] = await Promise.all([
        fetcher.fetchInscribedNames(input?.cursor),
        ctx.bnsxDb.inscribedNames.count(),
      ]);

      return {
        results: inscribedNames,
        total,
      };
    }),

  getInscriptionByName: procedure
    .input(z.object({ name: z.string() }))
    .output(z.nullable(inscriptionByNameResult))
    .query(async ({ ctx, input }) => {
      expectDb(ctx.prisma);
      expectDb(ctx.bnsxDb);

      const { name, namespace } = nameObjectToHex(parseFqn(input.name));

      const inscribedName = await ctx.bnsxDb.inscribedNames.findFirst({
        select: {
          inscription_id: true,
        },
        where: {
          name: {
            name,
            namespace,
          },
        },
      });

      if (inscribedName === null) {
        return null;
      }

      const inscriptionId = inscriptionBuffToId(hexToBytes(inscribedName.inscription_id));

      const owner = await fetchInscriptionOwner(inscriptionId);

      return {
        inscriptionId,
        owner: owner || '',
      };
    }),

  getNameByInscription: procedure
    .input(z.object({ inscriptionId: z.string() }))
    .output(nameByInscriptionResult)
    .query(async ({ ctx, input }) => {
      expectDb(ctx.bnsxDb);

      const inscribedName = await ctx.bnsxDb.inscribedNames.findFirst({
        where: {
          inscription_id: input.inscriptionId,
        },
        select: {
          name: true,
        },
      });

      if (inscribedName === null || inscribedName.name === null) {
        return {
          name: null,
        };
      }

      const name = convertDbName(inscribedName.name);

      return {
        name: name.combined,
      };
    }),

  getInscriptionOwner: procedure
    .input(z.object({ inscriptionId: z.string() }))
    .output(z.object({ owner: z.string() }))
    .query(async ({ input }) => {
      const owner = await fetchInscriptionOwner(input.inscriptionId);
      return {
        owner: owner ?? '',
      };
    }),
});
