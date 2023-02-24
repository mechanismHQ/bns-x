import '../prisma-plugin';
import { FastifyPluginCallback } from 'fastify';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { queryHelperRouter } from './trpc/query-helper-router';
import { createContext } from './trpc/context';
import { TRPCError } from '@trpc/server';
import { getContractParts } from '../utils';
import type { FastifyPlugin } from './api-types';
import { simpleNamesForAddressSchema } from './api-types';
import { nameDetailsSchema } from './api-types';
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
  fastify.get(
    '/names/:fqn',
    {
      schema: {
        description: 'Fetch details for a given BNS Name',
        tags: ['bns'],
        params: z.object({
          fqn: z.string().describe('Fully qualified name, like `muneeb.btc`'),
        }),
        response: {
          200: nameDetailsSchema,
          404: z.object({
            error: z.object({
              message: z.string(),
            }),
          }),
          500: z.object({
            error: z.object({
              message: z.string(),
            }),
          }),
        },
      },
    },
    async (req, res) => {
      const caller = queryHelperRouter.createCaller(createContext({ req, res }));
      const { fqn } = req.params;
      try {
        const details = await caller.getNameDetails({ fqn });
        return res.status(200).send(details);
      } catch (error) {
        if (error instanceof TRPCError) {
          const status = getHTTPStatusCodeFromError(error);
          if (status !== 404) {
            console.error(`Error fetching details for ${fqn}:`, error);
          }
          return res.status(status).send({ error: { message: error.message } });
        }
        console.error(`Unexpected error fetching details for ${fqn}:`, error);
        return res.status(500).send({ error: { message: 'Unexpected error' } });
      }
    }
  );

  fastify.get(
    '/addresses/stacks/:principal',
    {
      schema: {
        summary: 'Fetch names owned by an address',
        description: `
Fetch a list of names owned by an address.

The logic for determining name order is:

- If they own a BNS core name, return that first
- If they have a BNS subdomain, return that
- If they don't own a BNS core name, but they own a BNSx name, return that
        `,
        tags: ['bns'],
        params: z.object({
          principal: z.string(),
        }),
        response: {
          200: simpleNamesForAddressSchema,
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
