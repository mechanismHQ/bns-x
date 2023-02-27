/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class BnsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Fetch all names owned by an address
     *
     * Fetch all names owned by an address. If you only need to show a single name
     * for the address, use the "fetch name owned by an address" endpoint for better performance.
     *
     * [example with BNSx](https://api.bns.xyz/api/addresses/stacks/SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60) [example without BNSx](https://api.bns.xyz/api/addresses/stacks/SP132QXWFJ11WWXPW4JBTM9FP6XE8MZWB8AF206FX)
     *
     * The logic for determining name order in the `names` property is:
     *
     * - If they own a BNS core name, return that first
     * - If they have a BNS subdomain, return that
     * - If they don't own a BNS core name, but they own a BNSx name, return that
     *
     * @param principal
     * @returns any Default Response
     * @throws ApiError
     */
    public getBnsAddressesStacks(
        principal: string,
    ): CancelablePromise<{
        names: Array<string>;
        displayName: string | null;
        coreName: {
            zonefileHash: string;
            leaseEndingAt: number | null;
            leaseStartedAt: number;
            owner: string;
            combined: string;
            decoded: string;
            name: string;
            namespace: string;
        } | null;
        legacy: {
            zonefileHash: string;
            leaseEndingAt: number | null;
            leaseStartedAt: number;
            owner: string;
            combined: string;
            decoded: string;
            name: string;
            namespace: string;
        } | null;
        primaryName: string | null;
        primaryProperties: {
            id: number;
            combined: string;
            decoded: string;
            name: string;
            namespace: string;
        } | null;
        nameProperties: Array<{
            id: number;
            combined: string;
            decoded: string;
            name: string;
            namespace: string;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/bns/addresses/stacks/{principal}',
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
