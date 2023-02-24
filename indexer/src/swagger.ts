import type { SwaggerOptions } from '@fastify/swagger';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export const OpenApiOptions: SwaggerOptions = {
  openapi: {
    servers: [
      {
        url: 'https://api.bns.xyz',
        description: 'Mainnet BNS API',
      },
    ],
    // openapi: '3.1.3',
    info: {
      title: 'BNS API',
      description: 'An API for fetching data from the Bitcoin Name Service',
      version: 'v0.1.0',
    },
    externalDocs: {
      url: 'https://github.com/mechanismHQ/bns-x',
      description: 'Source Repository',
    },
    tags: [{ name: 'bns', description: 'BNS Endpoints' }],
  },
  hideUntagged: true,
  transform: jsonSchemaTransform,
};
