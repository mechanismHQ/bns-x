import {
  BnsGetNameInfoResponse,
  BnsNamesOwnByAddressResponse,
} from "@stacks/stacks-blockchain-api-types";
import {
  FastifyInstance,
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  FastifyPluginCallback,
} from "fastify";
import { LegacyDetails } from "../contracts/types";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export type FastifyServer = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export type FastifyPlugin = FastifyPluginCallback<
  {},
  RawServerDefault,
  ZodTypeProvider
>;

export interface NameInfoResponseLegacy extends BnsGetNameInfoResponse {
  isBnsx: false;
}

export interface NameInfoResponseBnsx extends BnsGetNameInfoResponse {
  isBnsx: true;
  id: number;
  legacy: LegacyDetails | null;
}

export type NameInfoResponse = NameInfoResponseLegacy | NameInfoResponseBnsx;

// export interface NamesByAddressResponse extends BnsNamesOwnByAddressResponse {
//   primaryName: string;
// }

export const legacyPropsSchema = z.object({
  zonefileHash: z.string(),
  leaseEndingAt: z.nullable(z.number()),
  leaseStartedAt: z.number(),
  owner: z.string(),
  combined: z.string(),
  name: z.string(),
  namespace: z.string(),
});

export const bnsxNameSchema = z.object({
  id: z.number().int(),
  combined: z.string(),
  name: z.string(),
  namespace: z.string(),
  // legacy: z.nullable(legacyPropsSchema),
});

export const namesByAddressBaseSchema = z.object({
  names: z.array(z.string()),
  displayName: z.nullable(z.string()),
  legacy: z.nullable(legacyPropsSchema),
});

export const namesByAddressBnsxSchema = namesByAddressBaseSchema.extend({
  primaryName: z.nullable(z.string()),
  primaryProperties: z.nullable(bnsxNameSchema),
  nameProperties: z.array(bnsxNameSchema),
});

export type NamesByAddressResponse = z.infer<typeof namesByAddressBnsxSchema>;
