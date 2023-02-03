import { StacksPrisma } from "./stacks-api-db/client";
import { FastifyPluginAsync } from "./routes/api-types";
import fp from "fastify-plugin";
declare module "fastify" {
  interface FastifyInstance {
    // prisma: PrismaClient;
    stacksPrisma?: StacksPrisma;
  }
}

export const prismaPlugin: FastifyPluginAsync = fp(async (server, options) => {
  const dbEnv = process.env.STACKS_API_POSTGRES;
  const useDb = process.env.USE_DB;
  if (typeof dbEnv !== "undefined" && useDb === "1") {
    const stacksPrisma = new StacksPrisma();
    await Promise.all([
      // prisma.$connect(),
      stacksPrisma.$connect(),
    ]);

    server.decorate("stacksPrisma", stacksPrisma);

    server.addHook("onClose", async (server) => {
      await Promise.all([
        // await server.prisma.$disconnect(),
        await server.stacksPrisma?.$disconnect(),
      ]);
    });
  }
});
// });
