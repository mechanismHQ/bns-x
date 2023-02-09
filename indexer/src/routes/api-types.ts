import type { BnsGetNameInfoResponse } from '@stacks/stacks-blockchain-api-types';
import { BnsNamesOwnByAddressResponse } from '@stacks/stacks-blockchain-api-types';
import type {
  FastifyInstance,
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  FastifyPluginCallback,
  FastifyPluginAsync as FastifyPluginAsyncBase,
} from 'fastify';
import type { LegacyDetails } from '../contracts/types';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export type FastifyServer = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export type FastifyPlugin = FastifyPluginCallback<
  Record<any, any>,
  RawServerDefault,
  ZodTypeProvider
>;

export type FastifyPluginAsync = FastifyPluginAsyncBase<
  Record<any, any>,
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

export const simpleNamesForAddressSchema = z.object({
  names: z.array(z.string()),
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

export const simpleOrExtraNamesByAddress = z.union([
  simpleNamesForAddressSchema,
  namesByAddressBnsxSchema,
]);

export type NamesByAddressResponse = z.infer<typeof namesByAddressBnsxSchema>;
