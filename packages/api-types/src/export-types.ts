// This file is auto-generated. Do not change.
import type * as TrpcServer from '@trpc/server';

export type AppProcedures = {
  getAddressNames: AnyProc<
    'query',
    {
      /** A Stacks address to fetch names for */
      address: string;
    },
    {
      /** A list of names that the address owns */
      names: string[];
      /** A single name that can be shown as the "display name" for the user */
      displayName: string | null;
      /** The address's BNS Core name */
      coreName: {
        zonefileHash: string;
        leaseEndingAt: number | null;
        leaseStartedAt?: number | undefined;
        owner: string;
        combined: string;
        decoded: string;
        name: string;
        namespace: string;
      } | null;
      /** The address's BNSx primary name */
      primaryName: string | null;
      /** The name properties of the address's BNSx name */
      primaryProperties: {
        id: number;
        combined: string;
        decoded: string;
        name: string;
        namespace: string;
      } | null;
      /** An array of BNSx name properties */
      nameProperties: {
        id: number;
        combined: string;
        decoded: string;
        name: string;
        namespace: string;
      }[];
    }
  >;
  getNameDetails: AnyProc<
    'query',
    | {
        name: string;
        namespace: string;
      }
    | {
        fqn: string;
      },
    | {
        /** The STX address of the owner of this name */
        address: string;
        /** The blockchain where this name is owned. Currently only "stacks" is supported */
        blockchain: string;
        /** The Bitcoin block when this name expires */
        expire_block?: number | undefined;
        grace_period?: number | undefined;
        /** The last indexed transaction ID where an update to this name occurred */
        last_txid: string;
        resolver?: string | undefined;
        status: string;
        /** The user's full zonefile */
        zonefile: string;
        /** The sha256 hash of the user's zonefile */
        zonefile_hash: string;
        /** Returns a UTF-8-encoded version of the name. If the name is punycode, this will return the Unicode version of that name. */
        decoded: string;
        inscriptionId?: string | undefined;
        inscription?:
          | {
              blockHeight: number;
              timestamp: string;
              txid: string;
              sat: string;
            }
          | undefined;
        /** Some records are parsed and returned from the user's zonefile for convenience */
        zonefileRecords: {
          [x: string]: string;
        } & {
          /** Returns the `_btc._addr` TXT record from the user's zonefile, if present. */
          btcAddress?: string | undefined;
          /** Returns the `_._nostr` TXT record from the user's zonefile, if present */
          nostr?: string | undefined;
        };
        isBnsx: false;
      }
    | {
        /** The STX address of the owner of this name */
        address: string;
        /** The blockchain where this name is owned. Currently only "stacks" is supported */
        blockchain: string;
        /** The Bitcoin block when this name expires */
        expire_block?: number | undefined;
        grace_period?: number | undefined;
        /** The last indexed transaction ID where an update to this name occurred */
        last_txid: string;
        resolver?: string | undefined;
        status: string;
        /** The user's full zonefile */
        zonefile: string;
        /** The sha256 hash of the user's zonefile */
        zonefile_hash: string;
        /** Returns a UTF-8-encoded version of the name. If the name is punycode, this will return the Unicode version of that name. */
        decoded: string;
        inscriptionId?: string | undefined;
        inscription?:
          | {
              blockHeight: number;
              timestamp: string;
              txid: string;
              sat: string;
            }
          | undefined;
        /** Some records are parsed and returned from the user's zonefile for convenience */
        zonefileRecords: {
          [x: string]: string;
        } & {
          /** Returns the `_btc._addr` TXT record from the user's zonefile, if present. */
          btcAddress?: string | undefined;
          /** Returns the `_._nostr` TXT record from the user's zonefile, if present */
          nostr?: string | undefined;
        };
        isBnsx: true;
        id: number;
        wrapper: string;
      }
  >;
  getDisplayName: AnyProc<
    'query',
    string,
    {
      name: string | null;
    }
  >;
  getNameExists: AnyProc<'query', string, boolean>;
  getAddressNameStrings: AnyProc<
    'query',
    {
      /** A Stacks address to fetch names for */
      address: string;
    },
    {
      /** The BNS core name owned by this address */
      coreName: string | null;
      /** The BNSx names owned by this address */
      bnsxNames: {
        name: string;
        id: number;
      }[];
    }
  >;
  getCoreName: AnyProc<
    'query',
    {
      /** A Stacks address to fetch names for */
      address: string;
    },
    string | null
  >;
  inscriptions: TrpcServer.CreateRouterInner<
    TrpcServer.AnyRootConfig,
    {
      create: AnyProc<
        'mutation',
        {
          inscriptionId: string;
        },
        {
          success: boolean;
          inscriptionId: string;
        }
      >;
      fetchZonefile: AnyProc<
        'query',
        {
          inscriptionId: string;
        },
        {
          success: boolean;
          inscriptionId: string;
          inscription: {
            id: string;
            address: string;
            sat: string;
            outputValue: number;
            contentType: string;
            timestamp: number;
            genesisHeight: number;
            genesisFee: string;
            genesisTransaction: string;
            location: string;
            output: string;
            offset: string;
            content: string;
          };
          zonefile: {
            verified: boolean;
            owner: string;
            zonefile: string;
            intro: string;
            zonefileInfo?: any;
          };
        }
      >;
      fetchAll: AnyProc<
        'query',
        {
          skip?: number | undefined;
        },
        unknown
      >;
    }
  >;
  zonefiles: TrpcServer.CreateRouterInner<
    TrpcServer.AnyRootConfig,
    {
      allNostr: AnyProc<
        'query',
        unknown,
        {
          results: {
            name: string;
            zonefile: string;
            nostr: string;
          }[];
        }
      >;
    }
  >;
  bridgeRouter: TrpcServer.CreateRouterInner<
    TrpcServer.AnyRootConfig,
    {
      inscribedNames: AnyProc<
        'query',
        unknown,
        {
          results: {
            inscriptionId: string;
            id: number;
            name: string;
          }[];
        }
      >;
      getInscriptionByName: AnyProc<
        'query',
        {
          name: string;
        },
        {
          inscriptionId: string;
        }
      >;
    }
  >;
};

type AnyProc<Type extends 'query' | 'mutation', Input, Output> = TrpcServer.BuildProcedure<
  Type,
  {
    _config: TrpcServer.AnyRootConfig;
    _meta: Record<string, any>;
    _ctx_out: Record<string, any>;
    _input_in: Input;
    _input_out: Input;
    _output_in: Output;
    _output_out: Output;
  },
  unknown
>;

export type AppRouter = TrpcServer.Router<{
  _config: TrpcServer.AnyRootConfig;
  router: true;
  queries: Record<string, any>;
  mutations: Record<string, any>;
  subscriptions: Record<string, any>;
  // procedures: Record<string, any>;
  procedures: AppProcedures;
  record: AppProcedures;
}>;
