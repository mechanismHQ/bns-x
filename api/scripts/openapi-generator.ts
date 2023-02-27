import Fastify from 'fastify';
// import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyPluginAsync } from '../src/routes/api-types';
import { OpenApiOptions } from '../src/swagger';
import { makeApp } from '../src/app';
// import { Api, ApiSwaggerOptions } from '../src/api/init';
import FastifySwagger from '@fastify/swagger';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { Server } from 'http';
import { appRouter } from '../src/routes/trpc';
import { generateOpenApiDocument } from 'trpc-openapi-fork-fastify-pr-177';
import { join } from 'path';

export const clientDir = join(__dirname, '..', '..', 'packages', 'client', 'tmp');

/**
 * Generates `openapi.yaml` based on current Swagger definitions.
 */
export const ApiGenerator: FastifyPluginAsync = async (fastify, _options) => {
  // await fastify.register(FastifySwagger, OpenApiOptions);
  // await fastify.register(Api);
  if (!existsSync(clientDir)) {
    await mkdir(clientDir);
  }
  const tRPC = generateOpenApiDocument(appRouter, {
    title: 'BNS tRPC API',
    description: 'tRPC-enabled endpoints',
    version: '3.0.3',
    baseUrl: 'https://api.bns.xyz',
  });
  await writeFile(join(clientDir, 'trpc.json'), JSON.stringify(tRPC, null, 2), {
    encoding: 'utf-8',
  });
  await writeFile(join(clientDir, 'openapi.yaml'), fastify.swagger({ yaml: true }));
};

async function run() {
  delete process.env.STACKS_API_POSTGRES;
  delete process.env.BNSX_DB_URL;
  const app = await makeApp({ withSwagger: true });
  await app.register(ApiGenerator);
  await app.close();
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
