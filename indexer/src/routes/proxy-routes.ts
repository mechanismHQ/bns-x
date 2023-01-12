import "../prisma-plugin";
import { FastifyPluginCallback } from "fastify";
import proxy from "@fastify/http-proxy";

export const proxyRoutes: FastifyPluginCallback = (fastify, opts, done) => {
  const upstream =
    process.env.STACKS_API_UPSTREAM ||
    "https://stacks-node-api.mainnet.stacks.co";
  const prefixes = [
    "/v1/names",
    "/v1/namespaces",
    "/v1/addresses",
    "/v2/prices",
  ];

  prefixes.forEach((prefix) => {
    fastify.register(proxy, {
      upstream,
      prefix,
      rewritePrefix: prefix,
    });
  });
  done();
};
