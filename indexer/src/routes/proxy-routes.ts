import '../prisma-plugin';
import type { FastifyPluginAsync } from 'fastify';
import proxy from '@fastify/http-proxy';

export const proxyRoutes: FastifyPluginAsync = async (fastify, opts) => {
  const upstream = process.env.STACKS_API_UPSTREAM || 'https://stacks-node-api.mainnet.stacks.co';
  const prefixes = ['/v1/names', '/v1/namespaces', '/v1/addresses', '/v2/prices'];

  await Promise.all(
    prefixes.map(prefix => {
      return fastify.register(proxy, {
        upstream,
        prefix,
        rewritePrefix: prefix,
      });
    })
  );
};
