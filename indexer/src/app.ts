import fastify, { FastifyServerOptions } from "fastify";
import { prismaPlugin } from "./prisma-plugin";
import { aliasRoutes } from "./routes/aliases";
import { proxyRoutes } from "./routes/proxy-routes";
import { getContracts } from "./contracts";
import { mergeRouters } from "./routes/trpc";
import { queryHelperRouter } from "./routes/query-helper-router";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createContext } from "./routes/context";

const options: FastifyServerOptions = {};
if (process.env.NODE_ENV === "test") {
  options.logger = {
    level: "debug",
    file: "./tmp/log.txt",
  };
}

export const app = fastify(options);

app.register(cors);

if (process.env.POSTGRES_URL) {
  app.register(prismaPlugin);
}

const appRouter = mergeRouters(queryHelperRouter);

export type AppRouter = typeof appRouter;

app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

const contracts = getContracts();
// Handler for production without contracts
if (typeof contracts.bnsxRegistry !== "undefined") {
  app.register(aliasRoutes, {
    prefix: "/v1",
  });
} else {
  app.register(proxyRoutes);
}

app.get("/", (req, res) => {
  return res.send({ success: true });
});
