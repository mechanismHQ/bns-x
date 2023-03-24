import '../prisma-plugin';
import { FastifyPluginCallback } from 'fastify';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { queryHelperRouter } from './trpc/query-helper-router';
import { createContext } from './trpc/context';
import { TRPCError } from '@trpc/server';
import { getContractParts } from '../utils';
import type { FastifyPlugin } from './api-types';
import { simpleNamesForAddressSchema, nameDetailsSchema } from '@bns-x/core';
import { errorSchema } from '@routes/api-types';
import { z } from 'zod';

export const aliasRoutes: FastifyPlugin = (fastify, opts, done) => {
  fastify.get(
    '/names/:fqn',
    {
      schema: {
        description: `
Fetch information about a specific name

[example with BNSx](https://api.bns.xyz/v1/names/hello-bnsx.btc) [example without bnsx](https://api.bns.xyz/v1/names/muneeb.btc)
        `,
        summary: 'Fetch name details',
        tags: ['Backwards Compatible'],
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
            console.error(`Unable to find details for ${fqn}`);
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
        summary: 'Fetch name owned by an address',
        description: `
Fetch a list of names owned by an address.

Note: for compatibility purposes, this API only returns a single name found for the address. For
fetching all names an address owns, use the "fetch all names owned by an address" endpoint.

[example with BNSx](https://api.bns.xyz/v1/addresses/stacks/SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60) [example without BNSx](https://api.bns.xyz/v1/addresses/stacks/SP132QXWFJ11WWXPW4JBTM9FP6XE8MZWB8AF206FX)

The logic for determining name order is:

- If they own a BNS core name, return that first
- If they have a BNS subdomain, return that
- If they don't own a BNS core name, but they own a BNSx name, return that
        `,
        tags: ['Backwards Compatible'],
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
      const caller = queryHelperRouter.createCaller(createContext({ req, res }));
      try {
        const { name } = await caller.getDisplayName(principal);
        const names: string[] = [];
        if (name !== null) names.push(name);
        return res.status(200).send({ names });
      } catch (error) {
        return res.status(500).send({ error: { message: 'Unexpected error' } });
      }
    }
  );

  done();
};
