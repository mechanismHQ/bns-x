import type { FastifyPlugin } from './api-types';
import { errorSchema } from './api-types';
import { namesByAddressBnsxSchema } from './api-types';
import { z } from 'zod';
import { logger } from '~/logger';

export const namesRoutes: FastifyPlugin = (fastify, _opts, done) => {
  fastify.get(
    '/addresses/stacks/:address',
    {
      schema: {
        summary: 'Fetch all names owned by an address',
        tags: ['BNS'],
        description: `
Fetch all names owned by an address. If you only need to show a single name
for the address, use the "fetch name owned by an address" endpoint for better performance.

[example with BNSx](https://api.bns.xyz/api/addresses/stacks/SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60) [example without BNSx](https://api.bns.xyz/api/addresses/stacks/SP132QXWFJ11WWXPW4JBTM9FP6XE8MZWB8AF206FX)

The logic for determining name order in the \`names\` property is:

- If they own a BNS core name, return that first
- If they have a BNS subdomain, return that
- If they don't own a BNS core name, but they own a BNSx name, return that
        `,
        params: z.object({
          principal: z.string(),
        }),
        response: {
          200: namesByAddressBnsxSchema,
          404: errorSchema,
          500: errorSchema,
        },
      },
    },
    async (req, res) => {
      const { principal } = req.params;
      try {
        const names = await req.server.fetcher.getAddressNames(principal);
        return res.status(200).send(names);
      } catch (error) {
        logger.error(`Unexpected error fetching details for ${principal}:`, { error });
        return res.status(500).send({ error: { message: 'Unexpected error' } });
      }
    }
  );

  done();
};
