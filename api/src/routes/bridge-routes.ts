import { createContext } from '@routes/trpc/context';
import type { FastifyPlugin } from './api-types';
import {
  bridgeRouter,
  inscribedNamesOptionsSchema,
  inscribedNamesResultsSchema,
  inscriptionByNameResult,
  nameByInscriptionResult,
} from './trpc/bridge-router';
import { z } from 'zod';
import { expectDb } from '@db/db-utils';

export const bridgeRoutes: FastifyPlugin = (fastify, opts, done) => {
  fastify.get(
    '/inscribed-names',
    {
      schema: {
        description: 'Fetch all BNS names inscribed and bridge to L1',
        summary: 'Fetch all inscribed names',
        tags: ['L1'],
        querystring: z.object({
          cursor: z
            .optional(z.string())
            .describe(
              'An optional ID to use for pagination. If included, only results after this ID will be returned'
            ),
        }),
        response: {
          200: inscribedNamesResultsSchema,
        },
      },
    },
    async (req, res) => {
      const cursor = req.query?.cursor ? parseInt(req.query.cursor, 10) : undefined;
      const caller = bridgeRouter.createCaller(createContext({ req, res }));
      const inscribedNames = await caller.inscribedNames({ cursor });
      return res.status(200).send(inscribedNames);
    }
  );

  fastify.get(
    '/inscription-by-name/:name',
    {
      schema: {
        description: 'Fetch inscription details for a given name',
        summary: 'Fetch inscription by name',
        tags: ['L1'],
        params: z.object({
          name: z.string(),
        }),
        response: {
          200: inscriptionByNameResult,
          404: z.object({ error: z.object({ message: z.string() }) }),
        },
      },
    },
    async (req, res) => {
      const { name } = req.params;
      const caller = bridgeRouter.createCaller(createContext({ req, res }));
      const info = await caller.getInscriptionByName({ name });
      if (info === null) {
        return res.status(404).send({ error: { message: 'Not found' } });
      }
      return res.status(200).send(info);
    }
  );

  fastify.get(
    '/name-by-inscription/:inscriptionId',
    {
      schema: {
        description: 'Fetch name details for a given inscription',
        summary: 'Fetch name for inscription',
        tags: ['L1'],
        params: z.object({ inscriptionId: z.string() }),
        response: {
          200: nameByInscriptionResult,
          404: z.object({ error: z.object({ message: z.string() }) }),
        },
      },
    },
    async (req, res) => {
      const { inscriptionId } = req.params;
      const caller = bridgeRouter.createCaller(createContext({ req, res }));
      try {
        const info = await caller.getNameByInscription({ inscriptionId });
        return res.status(200).send(info);
      } catch (error) {
        return res.status(404).send({ error: { message: 'Not found' } });
      }
    }
  );

  fastify.get(
    '/total-l1-names',
    {
      schema: {
        description: 'Fetch total number of names inscribed and bridge to L1',
        summary: 'Fetch total number of inscribed names',
        tags: ['L1'],
        response: {
          200: z.object({
            total: z.number(),
          }),
        },
      },
    },
    async (req, res) => {
      const db = req.server.prisma;
      expectDb(db);
      const total = await db.inscribedNames.count();
      return res.status(200).send({ total });
    }
  );

  done();
};
