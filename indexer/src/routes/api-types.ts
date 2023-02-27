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

/**
 * address: string;
  blockchain: string;
  expire_block?: number;
  grace_period?: number;
  last_txid: string;
  resolver?: string;
  status: string;
  zonefile: string;
  zonefile_hash: string;
 */

export const zonefileRecordsSchema = z
  .intersection(
    z.record(z.string(), z.string()),
    z.object({
      btcAddress: z
        .optional(z.string())
        .describe("Returns the `_btc._addr` TXT record from the user's zonefile, if present."),
      nostr: z
        .optional(z.string())
        .describe("Returns the `_._nostr` TXT record from the user's zonefile, if present"),
    })
  )
  .describe("Some records are parsed and returned from the user's zonefile for convenience");

export type ZonefileRecords = z.infer<typeof zonefileRecordsSchema>;

export const nameDetailsBaseSchema = z.object({
  address: z.string().describe('The STX address of the owner of this name'),
  blockchain: z
    .string()
    .describe('The blockchain where this name is owned. Currently only "stacks" is supported'),
  expire_block: z.optional(z.number()).describe('The Bitcoin block when this name expires'),
  grace_period: z.optional(z.number()),
  last_txid: z
    .string()
    .describe('The last indexed transaction ID where an update to this name occurred'),
  resolver: z.optional(z.string()),
  status: z.string(),
  zonefile: z.string().describe("The user's full zonefile"),
  zonefile_hash: z.string().describe("The sha256 hash of the user's zonefile"),
  decoded: z
    .string()
    .describe(
      'Returns a UTF-8-encoded version of the name. If the name is punycode, this will return the Unicode version of that name.'
    ),
  inscriptionId: z.optional(z.string()),
  inscription: z.optional(
    z.object({
      blockHeight: z.number(),
      timestamp: z.string(),
      txid: z.string(),
      sat: z.string(),
    })
  ),
  zonefileRecords: zonefileRecordsSchema,
});

export const nameDetailsCoreSchema = nameDetailsBaseSchema.extend({
  isBnsx: z.literal(false),
});

export const nameDetailsBnsxSchema = nameDetailsBaseSchema.extend({
  isBnsx: z.literal(true),
  id: z.number(),
});

export const nameDetailsSchema = z.union([nameDetailsCoreSchema, nameDetailsBnsxSchema]);

export type NameInfoResponse = z.infer<typeof nameDetailsSchema>;

export interface NameInfoResponseLegacy extends BnsGetNameInfoResponse {
  isBnsx: false;
}

export interface NameInfoResponseBnsx extends BnsGetNameInfoResponse {
  isBnsx: true;
  id: number;
}

export interface InscriptionMeta {
  inscriptionId?: string;
  inscription?: {
    blockHeight: number;
    timestamp: string;
    txid: string;
    sat: string;
  };
}

// export interface ZonefileRecords {
//   btcAddress?: string;
//   nostr?: string;
//   [key: string]: string | undefined;
// }

// export interface ZonefileInfo {
//   zonefileRecords: ZonefileRecords;
// }

// export type NameInfoResponse = (NameInfoResponseLegacy | NameInfoResponseBnsx) &
//   InscriptionMeta &
//   ZonefileInfo & { decoded: string };

// export interface NamesByAddressResponse extends BnsNamesOwnByAddressResponse {
//   primaryName: string;
// }

export const legacyPropsSchema = z.object({
  zonefileHash: z.string(),
  leaseEndingAt: z.nullable(z.number()),
  leaseStartedAt: z.number(),
  owner: z.string(),
  combined: z.string(),
  decoded: z.string(),
  name: z.string(),
  namespace: z.string(),
});

export const bnsxNameSchema = z.object({
  id: z.number().int(),
  combined: z.string(),
  decoded: z.string(),
  name: z.string(),
  namespace: z.string(),
  // legacy: z.nullable(legacyPropsSchema),
});

export const displayNameResponseSchema = z.object({ name: z.nullable(z.string()) });

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

export const errorSchema = z.object({
  error: z.object({
    message: z.string(),
  }),
});
