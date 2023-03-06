import type { FastifyServerOptions } from 'fastify';
import fastify from 'fastify';
import { prismaPlugin } from './prisma-plugin';
import { aliasRoutes } from './routes/alias-routes';
import { proxyRoutes } from './routes/proxy-routes';
import { getContracts } from './contracts';
import { metadataRoutes } from './routes/metadata-routes';
import { appRouter } from './routes/trpc';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createContext } from './routes/trpc/context';
import { getNetworkKey, getNodeUrl } from './constants';
import staticPlugin from '@fastify/static';
import metricsPlugin from 'fastify-metrics';
import { join } from 'path';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import { serverMetricsPlugin } from './metrics';
import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { logger } from '~/logger';
import { listenerPlugin } from '~/plugins/listener';
import FastifySwagger from '@fastify/swagger';
import { OpenApiOptions } from '~/swagger';
import SwaggerUi from '@fastify/swagger-ui';
import { fastifyTRPCOpenApiPlugin } from 'trpc-openapi-fork-fastify-pr-177';
import { namesRoutes } from '@routes/names-routes';
import { trpcOpenApiRouter } from '@routes/trpc-openapi';

const options: FastifyServerOptions = {
  logger,
};

export async function makeApp({
  withSwagger: _withSwagger = false,
}: { withSwagger?: boolean } = {}) {
  const app = fastify(options).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(FastifySwagger, OpenApiOptions);
  await app.register(SwaggerUi, {
    routePrefix: '/documentation',
  });

  await app.register(cors);

  await app.register(prismaPlugin);

  if (process.env.WORKER === 'true') {
    logger.info('Starting worker');
    await app.register(listenerPlugin);
  }

  app.setErrorHandler(function (error, request, reply) {
    logger.error(
      {
        error,
        path: request.url,
      },
      'API Server Error'
    );
    if (error instanceof TRPCError) {
      const status = getHTTPStatusCodeFromError(error);
      return reply.status(status).send({ error: error.message, code: error.code });
    }
    return reply.status(500).send({ error: 'Internal server error' });
  });

  await app.register(metricsPlugin);

  await app.register(serverMetricsPlugin);

  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
  });

  await app.register(namesRoutes, {
    prefix: '/bns',
  });

  const staticRoot = join(__dirname, '..', 'static');
  // console.log("Serving static files from", staticRoot);
  await app.register(staticPlugin, {
    root: staticRoot,
    prefix: '/static/',
    cacheControl: true,
    maxAge: '1d',
  });

  await app.register(metadataRoutes);

  const networkKey = getNetworkKey();
  console.log(`NETWORK_KEY=${networkKey}`);
  console.log(`STACKS_API=${getNodeUrl()}`);

  await app.register(aliasRoutes, {
    prefix: '/v1',
  });

  app.get('/', (req, res) => {
    return res.send({ success: true });
  });

  return app;
}
