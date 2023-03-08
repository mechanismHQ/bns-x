import type { Jsonize, FunctionReturnType } from '@clarigen/core';
import type { contracts } from './clarigen';
import { z } from 'zod';

export type Registry = typeof contracts['bnsxRegistry']['functions'];
export type QueryHelper = typeof contracts['queryHelper']['functions'];

export type NameProperties = NonNullable<FunctionReturnType<Registry['getNameProperties']>>;

export type NamePropertiesJson = Jsonize<NameProperties>;

export type QueryHelperResponse = FunctionReturnType<QueryHelper['getNames']>;

export type QueryHelperLegacyName = Jsonize<NonNullable<QueryHelperResponse['legacy']>>;
export type QueryHelperName = Jsonize<QueryHelperResponse['names'][number]> & {
  legacy: Jsonize<NonNullable<QueryHelperResponse['names'][number]['legacy']>>;
};

export type NameBase = {
  name: string;
  namespace: string;
  id?: string | number;
};

export type NameBuff = {
  name: Uint8Array;
  namespace: Uint8Array;
  id?: string | number;
};

export type ExtraNameProps = {
  combined: string;
  decoded: string;
};

export type NameExtended = NameBase & ExtraNameProps;

export type WithCombined<T extends NameBase | NameBuff> = T extends NameBuff
  ? Omit<T, 'name' | 'namespace'> & NameBase & ExtraNameProps
  : T & ExtraNameProps;

export type LegacyJson = NonNullable<QueryHelperName['legacy']>;

export type LegacyDetails = Omit<LegacyJson, 'leaseStartedAt' | 'leaseEndingAt'> & {
  leaseStartedAt: number;
  leaseEndingAt: number | null;
};

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
  wrapper: z.string(),
});

export const nameDetailsSchema = z.union([nameDetailsCoreSchema, nameDetailsBnsxSchema]);

export type NameInfoResponse = z.infer<typeof nameDetailsSchema>;

export interface InscriptionMeta {
  inscriptionId?: string;
  inscription?: {
    blockHeight: number;
    timestamp: string;
    txid: string;
    sat: string;
  };
}

export const legacyPropsSchema = z.object({
  zonefileHash: z.string(),
  leaseEndingAt: z.nullable(z.number()),
  leaseStartedAt: z.optional(z.number()),
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
});

export const displayNameResponseSchema = z.object({ name: z.nullable(z.string()) });

export const simpleNamesForAddressSchema = z.object({
  names: z.array(z.string()),
});

export const namesByAddressBaseSchema = z.object({
  names: z.array(z.string()).describe('A list of names that the address owns'),
  displayName: z
    .nullable(z.string())
    .describe('A single name that can be shown as the "display name" for the user'),
  coreName: z.nullable(legacyPropsSchema).describe("The address's BNS Core name"),
});

export const namesByAddressBnsxSchema = namesByAddressBaseSchema.extend({
  primaryName: z.nullable(z.string()).describe("The address's BNSx primary name"),
  primaryProperties: z
    .nullable(bnsxNameSchema)
    .describe("The name properties of the address's BNSx name"),
  nameProperties: z.array(bnsxNameSchema).describe('An array of BNSx name properties'),
});

export const simpleOrExtraNamesByAddress = z.union([
  simpleNamesForAddressSchema,
  namesByAddressBnsxSchema,
]);

export type NamesByAddressResponse = z.infer<typeof namesByAddressBnsxSchema>;
