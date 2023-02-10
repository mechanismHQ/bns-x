import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
export function createContext({ req, res }: CreateFastifyContextOptions) {
  const prisma = req.server.stacksPrisma;
  const bnsxDb = req.server.prisma;
  return { req, res, prisma, bnsxDb };
}
export type Context = inferAsyncReturnType<typeof createContext>;
