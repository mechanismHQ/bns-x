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
    tags: [
      { name: 'BNS', description: 'BNS Endpoints' },
      { name: 'Backwards Compatible', description: 'Stacks API compatible Endpoints' },
      { name: 'L1', description: 'Endpoints for querying the BNS-L1 bridge' },
    ],
  },
  hideUntagged: true,
  transform: jsonSchemaTransform,
};
