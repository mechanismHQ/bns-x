import fastify, { FastifyServerOptions } from "fastify";
import { prismaPlugin } from "./prisma-plugin";
import { aliasRoutes } from "./routes/alias-routes";
import { proxyRoutes } from "./routes/proxy-routes";
import { getContracts } from "./contracts";
import { metadataRoutes } from "./routes/metadata-routes";
import { appRouter } from "./routes/trpc";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createContext } from "./routes/trpc/context";
import { getNetworkKey, getNodeUrl } from "./constants";
import staticPlugin from "@fastify/static";
import metricsPlugin from "fastify-metrics";
import { join } from "path";
import {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import { makeMetrics } from "./metrics";

const options: FastifyServerOptions = {};
if (process.env.NODE_ENV === "test") {
  options.logger = {
    level: "debug",
    file: "./tmp/log.txt",
  };
}

export const app = fastify(options).withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors);

app.register(metricsPlugin);

makeMetrics(app);

if (process.env.STACKS_API_POSTGRES) {
  app.register(prismaPlugin);
}

app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

const staticRoot = join(__dirname, "..", "static");
// console.log("Serving static files from", staticRoot);
app.register(staticPlugin, {
  root: staticRoot,
  prefix: "/static/",
  cacheControl: true,
  maxAge: "1d",
});

app.register(metadataRoutes);

const networkKey = getNetworkKey();
console.log(`NETWORK_KEY=${networkKey}`);
console.log(`STACKS_API=${getNodeUrl()}`);

const contracts = getContracts();

// Handler for production without contracts
if (typeof contracts.bnsxRegistry !== "undefined") {
  console.log("Real mode");
  app.register(aliasRoutes, {
    prefix: "/v1",
  });
} else {
  console.log("Proxy mode");
  app.register(proxyRoutes);
}

app.get("/", (req, res) => {
  return res.send({ success: true });
});
