import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { PrismaClient } from "@prisma/client";
import { StacksPrisma } from "./stacks-api/client";

// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    stacksPrisma: StacksPrisma;
  }
}

export const prismaPlugin: FastifyPluginAsync = fp(async (server, options) => {
  const prisma = new PrismaClient();
  const stacksPrisma = new StacksPrisma();

  await Promise.all([prisma.$connect(), stacksPrisma.$connect()]);

  // Make Prisma Client available through the fastify server instance: server.prisma
  server.decorate("prisma", prisma);
  server.decorate("stacksPrisma", stacksPrisma);

  server.addHook("onClose", async (server) => {
    await Promise.all([
      await server.prisma.$disconnect(),
      await server.stacksPrisma.$disconnect(),
    ]);
  });
});
