/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UtilitiesService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Broadcast transaction to many neighbors
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public postTxBroadcast(
        requestBody: {
            txHex: string;
            attachment?: string;
        },
    ): CancelablePromise<{
        success: boolean;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/tx/broadcast',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
