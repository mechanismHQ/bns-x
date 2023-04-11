import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { expectDb } from '../../db/db-utils';
import {
  fetchInscription,
  inscriptionSchema,
  inscriptionVerifyResultSchema,
  verifyInscriptionZonefile,
} from '../../fetchers/inscriptions';
import { router, procedure } from './base';
import { logger } from '~/logger';

export const createInscriptionInput = z.object({
  inscriptionId: z.string(),
});

export const inscriptionRouter = router({
  create: procedure
    .input(createInscriptionInput)
    .output(
      z.object({
        success: z.boolean(),
        inscriptionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { inscriptionId } = input;
      const db = ctx.bnsxDb;
      if (typeof db === 'undefined') {
        throw new TRPCError({
          message: ``,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
      try {
        const inscription = await fetchInscription(inscriptionId);
        const content = await verifyInscriptionZonefile(inscription.content);
        if (!content.verified) {
          throw new TRPCError({
            message: 'The zonefile inscription provided is not valid',
            code: 'BAD_REQUEST',
          });
        }
        const dbData = {
          inscriptionContent: inscription.content,
          inscriptionContentType: inscription.contentType,
          sat: inscription.sat,
          inscriptionId: inscription.id,
          inscriptionOwner: inscription.address,
          output: inscription.output,
          location: inscription.location,
          name: content.zonefileInfo.name,
          namespace: content.zonefileInfo.namespace,
          stxAddress: content.zonefileInfo.owner,
          zonefileRaw: content.zonefileInfo.zonefile,
          timestamp: inscription.timestamp,
          genesisHeight: inscription.genesisHeight,
          genesisTransaction: inscription.genesisTransaction,
          outputValue: inscription.outputValue,
        };
        console.log(dbData);
        const model = await db.inscriptionZonefiles.upsert({
          where: {
            inscriptionId: inscription.id,
          },
          create: dbData,
          update: dbData,
        });
        console.log('New zonefile inscription!', model);
        return {
          success: true,
          inscriptionId,
        };
      } catch (error) {
        logger.error({ error }, `Unable to fetch details for ${inscriptionId}`);
        throw new TRPCError({
          message: `Unable to fetch details for ${inscriptionId}`,
          code: 'NOT_FOUND',
        });
      }
    }),

  fetchZonefile: procedure
    .input(createInscriptionInput)
    .output(
      z.object({
        success: z.boolean(),
        inscriptionId: z.string(),
        inscription: inscriptionSchema,
        zonefile: inscriptionVerifyResultSchema,
      })
    )
    .query(async ({ ctx, input }) => {
      const { inscriptionId } = input;
      const db = ctx.bnsxDb;
      if (typeof db === 'undefined') {
        throw new TRPCError({
          message: ``,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }
      try {
        const inscription = await fetchInscription(inscriptionId);
        const content = await verifyInscriptionZonefile(inscription.content);
        return {
          success: content.verified,
          inscriptionId,
          inscription,
          zonefile: content,
        };
      } catch (error) {
        logger.error({ error }, `Unable to fetch details for ${inscriptionId}`);
        throw new TRPCError({
          message: `Unable to fetch details for ${inscriptionId}`,
          code: 'NOT_FOUND',
        });
      }
    }),

  fetchAll: procedure
    .input(z.object({ skip: z.optional(z.number().positive()) }))
    .query(async ({ ctx, input }) => {
      expectDb(ctx.bnsxDb);
      const db = ctx.bnsxDb;
      const zonefiles = await db.inscriptionZonefiles.findMany({
        distinct: ['name', 'namespace'],
        orderBy: {
          timestamp: 'desc',
        },
        skip: input.skip ?? 0,
      });

      return zonefiles.map(z => {
        const { name, namespace, inscriptionId, genesisHeight, timestamp } = z;
        return {
          name,
          namespace,
          inscriptionId,
          genesisHeight,
          timestamp: new Date(Number(timestamp)).toISOString(),
        };
      });
    }),
});
