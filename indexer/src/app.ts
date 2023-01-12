import fastify, { FastifyServerOptions } from "fastify";
import { prismaPlugin } from "./prisma-plugin";
import { hooksRouter } from "./chainhooks";
import { aliasRoutes } from "./routes/aliases";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { dataRouter } from "./routes/trpc-router";
import { createContext } from "./routes/context";
import { eventObserverRoutes } from "./routes/events-observer";
import { proxyRoutes } from "./routes/proxy-routes";

const options: FastifyServerOptions = {};
if (process.env.NODE_ENV === "test") {
  options.logger = {
    level: "debug",
    file: "./tmp/log.txt",
  };
}

export const app = fastify(options);

if (process.env.POSTGRES_URL) {
  app.register(prismaPlugin);
  app.register(hooksRouter);
  // app.register(aliasRoutes);
  app.register(eventObserverRoutes, {
    // prefix: "events",
  });

  app.register(fastifyTRPCPlugin, {
    prefix: "/api",
    trpcOptions: {
      router: dataRouter,
      createContext,
    },
  });
}

app.register(proxyRoutes);

app.get("/", (req, res) => {
  return res.send({ success: true });
});
