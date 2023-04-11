// This file is auto-generated. Do not change.
import type * as TrpcServer from '@trpc/server';

export type AppProcedures = {
    getAddressNames: AnyProc<"query", {
        /** A Stacks address to fetch names for */
        address: string;
    }, {
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
    }>;
    getNameDetails: AnyProc<"query", {
        name: string;
        namespace: string;
    } | {
        fqn: string;
    }, unknown>;
    getDisplayName: AnyProc<"query", string, {
        name: string | null;
    }>;
    inscriptions: TrpcServer.CreateRouterInner<TrpcServer.AnyRootConfig, {
        create: AnyProc<"mutation", {
            inscriptionId: string;
        }, {
            success: boolean;
            inscriptionId: string;
        }>;
        fetchZonefile: AnyProc<"query", {
            inscriptionId: string;
        }, {
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
        }>;
        fetchAll: AnyProc<"query", {
            skip?: number | undefined;
        }, unknown>;
    }>;
    zonefiles: TrpcServer.CreateRouterInner<TrpcServer.AnyRootConfig, {
        allNostr: AnyProc<"query", unknown, {
            results: {
                name: string;
                zonefile: string;
                nostr: string;
            }[];
        }>;
    }>;
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
