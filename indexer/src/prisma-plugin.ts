import { StacksDb, BnsDb } from '@db';
import type { FastifyPluginAsync } from './routes/api-types';
import fp from 'fastify-plugin';
declare module 'fastify' {
  interface FastifyInstance {
    prisma?: BnsDb;
    stacksPrisma?: StacksDb;
  }
}

export const prismaPlugin: FastifyPluginAsync = fp(async server => {
  const dbEnv = process.env.STACKS_API_POSTGRES;
  if (typeof dbEnv === 'undefined') return;

  const stacksPrisma = new StacksDb();
  const params = new URLSearchParams(dbEnv.split('?')[1]);
  console.log('Connection query parameters:', params);
  const promises = [stacksPrisma.$connect()];
  const prismaDbEnv = process.env.BNSX_DB_URL;
  const prisma = new BnsDb();
  if (typeof prismaDbEnv !== 'undefined') {
    promises.push(prisma.$connect());
    server.decorate('prisma', prisma);
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
