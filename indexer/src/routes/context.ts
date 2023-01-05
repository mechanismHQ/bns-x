import { inferAsyncReturnType } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import "../prisma-plugin";
export function createContext({ req, res }: CreateFastifyContextOptions) {
  const prisma = req.server.prisma;
  return { req, res, prisma };
}
export type Context = inferAsyncReturnType<typeof createContext>;
