import { toUnicode } from '@bns-x/punycode';
import { router, procedure } from './base';
import { expectDb } from '@db/db-utils';
import { z } from 'zod';
import { convertDbName } from '~/contracts/utils';
import { parseFqn } from '@bns-x/core';
import { nameObjectToHex } from '~/utils';
import { TRPCError } from '@trpc/server';

const inscribedNameResult = z.object({
  inscriptionId: z.string(),
  id: z.number(),
  name: z.string(),
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
          select: {
            name: true,
            id: true,
            inscription_id: true,
          },
        })
      )
        .map(row => {
          if (row.name === null) return null;

          const name = convertDbName(row.name);

          return {
            inscriptionId: row.inscription_id,
            id: Number(row.id),
            name: name.combined,
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

      return {
        inscriptionId: inscribedName.inscription_id,
      };
    }),
});
