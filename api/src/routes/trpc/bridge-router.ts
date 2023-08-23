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

const inscribedNameResult = z.object({
  inscriptionId: z.string(),
  id: z.number(),
  name: z.string(),
  blockHeight: z.number(),
  txid: z.string(),
});

export const bridgeRouter = router({
  inscribedNames: procedure
    .output(
      z.object({
        results: z.array(inscribedNameResult),
      })
    )
    .query(async ({ ctx }) => {
      expectDb(ctx.prisma);
      expectDb(ctx.bnsxDb);

      const inscribedNames = (
        await ctx.bnsxDb.inscribedNames.findMany({
          include: {
            name: true,
          },
          orderBy: {
            blockHeight: 'desc',
          },
        })
      )
        .map(row => {
          if (row.name === null) return null;

          const name = convertDbName(row.name);

          return {
            inscriptionId: inscriptionBuffToId(hexToBytes(row.inscription_id)),
            id: Number(row.id),
            name: name.combined,
            blockHeight: row.blockHeight,
            txid: bytesToHex(row.txid),
          };
        })
        .filter((n): n is NonNullable<typeof n> => n !== null);

      return {
        results: inscribedNames,
      };
    }),

  getInscriptionByName: procedure
    .input(z.object({ name: z.string() }))
    .output(
      z.object({
        inscriptionId: z.string(),
        owner: z.string(),
      })
    )
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
        throw new TRPCError({
          message: `Unable to fetch inscription for ${input.name}`,
          code: 'NOT_FOUND',
        });
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
    .output(
      z.object({
        name: z.nullable(z.string()),
      })
    )
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
