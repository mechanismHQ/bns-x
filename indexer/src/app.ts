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

const options: FastifyServerOptions = {};
if (process.env.NODE_ENV === 'test') {
  options.logger = {
    level: 'debug',
    file: './tmp/log.txt',
  };
}

export async function makeApp() {
  const app = fastify(options).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors);

  if (process.env.STACKS_API_POSTGRES) {
    await app.register(prismaPlugin);
  }

  await app.register(metricsPlugin);

  await app.register(serverMetricsPlugin);

  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
    },
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

  const contracts = getContracts();

  // Handler for production without contracts
  if (typeof contracts.bnsxRegistry !== 'undefined') {
    console.log('Real mode');
    await app.register(aliasRoutes, {
      prefix: '/v1',
    });
  } else {
    console.log('Proxy mode');
    await app.register(proxyRoutes);
  }

  app.get('/', (req, res) => {
    return res.send({ success: true });
  });

  return app;
}
