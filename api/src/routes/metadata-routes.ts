import type { NftMetadata, NftProperty } from '../metadata';
import { nftMetadata } from '../metadata';
import type { FastifyPlugin } from './api-types';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getNameById } from '../fetchers/query-helper';

export const metadataRoutes: FastifyPlugin = (fastify, opts, done) => {
  fastify.get(
    '/nft-metadata/:id',
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: nftMetadata,
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (req, res) => {
      const name = await getNameById(req.params.id);

      if (name === null) {
        return res.status(404).send({ error: 'Not found' });
      }

      // const { leaseEndingAt, ...legacy } =

      const properties: Record<string, NftProperty> = {
        id: name.id,
        namespace: name.namespace,
        fullName: name.combined,
        name: name.name,
        collection: 'BNSx Names',
        collection_image: 'https://api.bns.xyz/static/bnsx-image.png',
      };

      if (name.legacy !== null) {
        const { leaseEndingAt, ...legacy } = name.legacy;
        properties.leaseStartedAt = legacy.leaseStartedAt;
        properties.zonefileHash = legacy.zonefileHash;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (leaseEndingAt) properties.leaseEndingAt = leaseEndingAt;
        properties.wrapperPrincipal = legacy.owner;
      }

      await res.send({
        sip: 16,
        name: name.combined,
        image: 'https://api.bns.xyz/static/bnsx-image.png',
        properties: properties,
      });
    }
  );
  done();
};
