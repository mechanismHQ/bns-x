import { StacksDb, BnsDb } from '@db';
import type { FastifyPluginAsync } from './routes/api-types';
import fp from 'fastify-plugin';
import type { BaseFetcher } from '@fetchers/adapters/base';
import { ApiFetcher } from '@fetchers/adapters/api-fetcher';
import { DbFetcher } from '@fetchers/adapters/db-fetcher';
import { logger } from '~/logger';
declare module 'fastify' {
  interface FastifyInstance {
    prisma?: BnsDb;
    stacksPrisma?: StacksDb;
    fetcher: BaseFetcher;
  }
}

function getStacksDb() {
  if (process.env.DEBUG_SLOW_QUERIES === 'true') {
    const stacksPrisma = new StacksDb({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
    stacksPrisma.$on('query', e => {
      if (e.duration > 500) {
        logger.warn(
          {
            query: e.query,
            duration: e.duration,
            params: e.params,
          },
          'slow query'
        );
      }
    });
    return stacksPrisma;
  }
  return new StacksDb();
}

function getBnsDb() {
  if (process.env.DEBUG_SLOW_QUERIES_BNSX === 'true') {
    const bnsPrisma = new BnsDb({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'stdout',
          level: 'error',
        },
        {
          emit: 'stdout',
          level: 'info',
        },
        {
          emit: 'stdout',
          level: 'warn',
        },
      ],
    });
    bnsPrisma.$on('query', e => {
      if (e.duration > 500) {
        logger.warn(
          {
            query: e.query,
            duration: e.duration,
            params: e.params,
          },
          'slow query'
        );
      }
    });
    return bnsPrisma;
  }
  return new BnsDb();
}

export const prismaPlugin: FastifyPluginAsync = fp(async server => {
  const dbEnv = process.env.STACKS_API_POSTGRES;
  if (typeof dbEnv === 'undefined' || dbEnv === '') {
    const fetcher = new ApiFetcher();
    server.decorate('fetcher', fetcher);
    return;
  }

  const stacksPrisma = getStacksDb();
  const params = dbEnv.split('?')[1];
  logger.debug({ params }, 'Stacks DB connection query parameters');
  const promises = [stacksPrisma.$connect()];
  const prismaDbEnv = process.env.BNSX_DB_URL;
  const prisma = getBnsDb();
  if (typeof prismaDbEnv !== 'undefined') {
    promises.push(prisma.$connect());
    server.decorate('prisma', prisma);

    const fetcher = new DbFetcher(prisma, stacksPrisma);
    server.decorate('fetcher', fetcher);
  }
  await Promise.all(promises);

  server.decorate('stacksPrisma', stacksPrisma);

  server.addHook('onClose', async server => {
    await Promise.all([
      // await server.prisma.$disconnect(),
      await server.stacksPrisma?.$disconnect(),
    ]);
  });
});
