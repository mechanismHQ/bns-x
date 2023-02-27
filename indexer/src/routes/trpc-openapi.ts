import { createContext } from '@routes/trpc/context';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { logger } from '~/logger';
import { appRouter } from '~/routes/trpc';
import type { FastifyPlugin } from './api-types';
import { errorSchema } from './api-types';

const procedures = [
  ['getAddressNames', appRouter.getAddressNames],
  ['getDisplayName', appRouter.getDisplayName],
  ['getNameDetails', appRouter.getNameDetails],
] as const;

type Fn<A, R> = (input: A) => Promise<R>;

export const trpcOpenApiRouter: FastifyPlugin = (fastify, _opts, done) => {
  for (const [path, proc] of procedures) {
    const input = proc._def._input_in;
    const output = proc._def._output_out;

    fastify.get(
      `/${path}`,
      {
        schema: {
          querystring: input,
          response: {
            200: output,
            // 500: errorSchema,
          },
        },
      },
      async (req, res) => {
        const router = appRouter.createCaller(createContext({ req, res }));
        const procedure = router[path] as Fn<typeof input, typeof output>;
        try {
          const result = await procedure(req.query as typeof input);
          return res.status(200).send(result);
        } catch (error) {
          if (error instanceof TRPCError) {
            const status = getHTTPStatusCodeFromError(error);
            return res.status(status).send({ error: { message: error.message } });
          }
          logger.error('Error in trpc openapi router', error);
          return res.status(500).send({ error: { message: 'Unexpected server error' } });
        }
      }
    );
  }

  done();
};
