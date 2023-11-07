/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class L1Service {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Fetch all inscribed names
     * Fetch all BNS names inscribed and bridge to L1
     * @param cursor An optional ID to use for pagination. If included, only results after this ID will be returned
     * @returns any Default Response
     * @throws ApiError
     */
    public getL1InscribedNames(
        cursor?: string,
    ): CancelablePromise<{
        total: number;
        results: Array<{
            inscriptionId: string;
            id: number;
            name: string;
            blockHeight: number;
            txid: string;
        }>;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/l1/inscribed-names',
            query: {
                'cursor': cursor,
            },
        });
    }

    /**
     * Fetch inscription by name
     * Fetch inscription details for a given name
     * @param name
     * @returns any Default Response
     * @throws ApiError
     */
    public getL1InscriptionByName(
        name: string,
    ): CancelablePromise<{
        inscriptionId: string;
        owner: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/l1/inscription-by-name/{name}',
            path: {
                'name': name,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

    /**
     * Fetch name for inscription
     * Fetch name details for a given inscription
     * @param inscriptionId
     * @returns any Default Response
     * @throws ApiError
     */
    public getL1NameByInscription(
        inscriptionId: string,
    ): CancelablePromise<{
        name: string | null;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/l1/name-by-inscription/{inscriptionId}',
            path: {
                'inscriptionId': inscriptionId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }

    /**
     * Fetch total number of inscribed names
     * Fetch total number of names inscribed and bridge to L1
     * @returns any Default Response
     * @throws ApiError
     */
    public getL1TotalL1Names(): CancelablePromise<{
        total: number;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/l1/total-l1-names',
        });
    }

}
