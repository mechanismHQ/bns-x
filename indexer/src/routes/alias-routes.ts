import '../prisma-plugin';
import { FastifyPluginCallback } from 'fastify';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { queryHelperRouter } from './trpc/query-helper-router';
import { createContext } from './trpc/context';
import { TRPCError } from '@trpc/server';
import { getContractParts } from '../utils';
import type { FastifyPlugin } from './api-types';
import { simpleOrExtraNamesByAddress } from './api-types';
import { namesByAddressBnsxSchema, NamesByAddressResponse } from './api-types';
import { z } from 'zod';
import { fetchDisplayName } from '../fetchers/stacks-api';

const errorSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});

export const aliasRoutes: FastifyPlugin = (fastify, opts, done) => {
  fastify.get<{
    Params: {
      fqn: string;
    };
  }>('/names/:fqn', async (req, res) => {
    console.log('req.params', req.params);
    const caller = queryHelperRouter.createCaller(createContext({ req, res }));
    const [name, namespace] = getContractParts(req.params.fqn);
    try {
      const details = await caller.getNameDetails({ name, namespace });
      return res.status(200).send(details);
    } catch (error) {
      if (error instanceof TRPCError) {
        const status = getHTTPStatusCodeFromError(error);
        if (status !== 404) {
          console.error(`Error fetching details for ${name}.${namespace}:`, error);
        }
        return res.status(status).send({ error: { message: error.message } });
      }
      console.error(`Unexpected error fetching details for ${name}.${namespace}:`, error);
      return res.status(500).send({ error: { message: 'Unexpected error' } });
    }
  });

  fastify.get(
    '/addresses/stacks/:principal',
    {
      schema: {
        params: z.object({
          principal: z.string(),
        }),
        response: {
          200: simpleOrExtraNamesByAddress,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    async (req, res) => {
      const { principal } = req.params;
      const { extra } = req.query as { extra?: string };
      const caller = queryHelperRouter.createCaller(createContext({ req, res }));
      if (!extra) {
        const { name } = await caller.getDisplayName(principal);
        const names: string[] = [];
        if (name !== null) names.push(name);
        return res.status(200).send({ names });
      }
      try {
        const names = await caller.getAddressNames(principal);
        return res.status(200).send(names);
      } catch (error) {
        if (error instanceof TRPCError) {
          const status = getHTTPStatusCodeFromError(error);
          console.error(`Error fetching details for ${principal}:`, error);
          return res.status(status).send({ error: { message: error.message } });
        }
        console.error(`Unexpected error fetching details for ${principal}:`, error);
        return res.status(500).send({ error: { message: 'Unexpected error' } });
      }
    }
  );

  done();
};
