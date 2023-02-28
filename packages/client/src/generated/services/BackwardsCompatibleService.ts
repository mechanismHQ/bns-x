/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class BackwardsCompatibleService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Fetch name details
     *
     * Fetch information about a specific name
     *
     * [example with BNSx](https://api.bns.xyz/v1/names/hello-bnsx.btc) [example without bnsx](https://api.bns.xyz/v1/names/muneeb.btc)
     *
     * @param fqn Fully qualified name, like `muneeb.btc`
     * @returns any Default Response
     * @throws ApiError
     */
    public getV1Names(
        fqn: string,
    ): CancelablePromise<({
        /**
         * The STX address of the owner of this name
         */
        address: string;
        /**
         * The blockchain where this name is owned. Currently only "stacks" is supported
         */
        blockchain: string;
        /**
         * The Bitcoin block when this name expires
         */
        expire_block?: number;
        grace_period?: number;
        /**
         * The last indexed transaction ID where an update to this name occurred
         */
        last_txid: string;
        resolver?: string;
        status: string;
        /**
         * The user's full zonefile
         */
        zonefile: string;
        /**
         * The sha256 hash of the user's zonefile
         */
        zonefile_hash: string;
        /**
         * Returns a UTF-8-encoded version of the name. If the name is punycode, this will return the Unicode version of that name.
         */
        decoded: string;
        inscriptionId?: string;
        inscription?: {
            blockHeight: number;
            timestamp: string;
            txid: string;
            sat: string;
        };
        /**
         * Some records are parsed and returned from the user's zonefile for convenience
         */
        zonefileRecords: (Record<string, string> & {
            /**
             * Returns the `_btc._addr` TXT record from the user's zonefile, if present.
             */
            btcAddress?: string;
            /**
             * Returns the `_._nostr` TXT record from the user's zonefile, if present
             */
            nostr?: string;
        });
        isBnsx: boolean;
    } | {
        /**
         * The STX address of the owner of this name
         */
        address: string;
        /**
         * The blockchain where this name is owned. Currently only "stacks" is supported
         */
        blockchain: string;
        /**
         * The Bitcoin block when this name expires
         */
        expire_block?: number;
        grace_period?: number;
        /**
         * The last indexed transaction ID where an update to this name occurred
         */
        last_txid: string;
        resolver?: string;
        status: string;
        /**
         * The user's full zonefile
         */
        zonefile: string;
        /**
         * The sha256 hash of the user's zonefile
         */
        zonefile_hash: string;
        /**
         * Returns a UTF-8-encoded version of the name. If the name is punycode, this will return the Unicode version of that name.
         */
        decoded: string;
        inscriptionId?: string;
        inscription?: {
            blockHeight: number;
            timestamp: string;
            txid: string;
            sat: string;
        };
        /**
         * Some records are parsed and returned from the user's zonefile for convenience
         */
        zonefileRecords: (Record<string, string> & {
            /**
             * Returns the `_btc._addr` TXT record from the user's zonefile, if present.
             */
            btcAddress?: string;
            /**
             * Returns the `_._nostr` TXT record from the user's zonefile, if present
             */
            nostr?: string;
        });
        isBnsx: boolean;
        id: number;
        wrapper: string;
    })> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/names/{fqn}',
            path: {
                'fqn': fqn,
            },
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }

    /**
     * Fetch name owned by an address
     *
     * Fetch a list of names owned by an address.
     *
     * Note: for compatibility purposes, this API only returns a single name found for the address. For
     * fetching all names an address owns, use the "fetch all names owned by an address" endpoint.
     *
     * [example with BNSx](https://api.bns.xyz/v1/addresses/stacks/SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60) [example without BNSx](https://api.bns.xyz/v1/addresses/stacks/SP132QXWFJ11WWXPW4JBTM9FP6XE8MZWB8AF206FX)
     *
     * The logic for determining name order is:
     *
     * - If they own a BNS core name, return that first
     * - If they have a BNS subdomain, return that
     * - If they don't own a BNS core name, but they own a BNSx name, return that
     *
     * @param principal
     * @returns any Default Response
     * @throws ApiError
     */
    public getV1AddressesStacks(
        principal: string,
    ): CancelablePromise<{
        names: Array<string>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v1/addresses/stacks/{principal}',
            path: {
                'principal': principal,
            },
            errors: {
                404: `Default Response`,
                500: `Default Response`,
            },
        });
    }

}
