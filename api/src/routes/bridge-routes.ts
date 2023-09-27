import { createContext } from '@routes/trpc/context';
import type { FastifyPlugin } from './api-types';
import { bridgeRouter, inscribedNamesResultsSchema } from './trpc/bridge-router';

export const bridgeRoutes: FastifyPlugin = (fastify, opts, done) => {
  fastify.get(
    '/inscribed-names',
    {
      schema: {
        description: 'Fetch all BNS names inscribed and bridge to L1',
        summary: 'Fetch all inscribed names',
        tags: ['L1'],
        response: {
          200: inscribedNamesResultsSchema,
        },
      },
    },
    async (req, res) => {
      const caller = bridgeRouter.createCaller(createContext({ req, res }));
      const inscribedNames = await caller.inscribedNames();
      return res.status(200).send(inscribedNames);
    }
  );

  // fastify.get('/inscription-by-name/:name', async (req, res) => {
  // }

  done();
};
