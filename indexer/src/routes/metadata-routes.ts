import type { NftMetadata, NftProperty } from "../metadata";
import { nftMetadata } from "../metadata";
import { FastifyPlugin } from "./api-types";
import { z } from "zod";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { getNameById } from "../fetchers/query-helper";

export const metadataRoutes: FastifyPlugin = (fastify, opts, done) => {
  fastify.get(
    "/nft-metadata/:id",
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
        return res.status(404).send({ error: "Not found" });
      }

      // const { leaseEndingAt, ...legacy } =

      const properties: Record<string, NftProperty> = {
        id: {
          type: "integer",
          description: "The SIP9 ID of this name",
          value: Number(name.id),
        },
        namespace: name.namespace,
        fullName: name.combined,
        name: name.name,
      };

      if (name.legacy !== null) {
        const { leaseEndingAt, ...legacy } = name.legacy;
        properties.leaseStartedAt = legacy.leaseStartedAt;
        properties.zonefileHash = legacy.zonefileHash;
        if (leaseEndingAt) properties.leaseEndingAt = leaseEndingAt;
        properties.wrapperPrincipal = legacy.owner;
      }

      res.send({
        sip: 16,
        name: name.combined,
        image: "https://api.bns.xyz/static/bnsx-image.png",
        properties: properties,
      });
    }
  );
  done();
};
