/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';

import { BackwardsCompatibleService } from './services/BackwardsCompatibleService';
import { BnsService } from './services/BnsService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class BNS {

    public readonly backwardsCompatible: BackwardsCompatibleService;
    public readonly bns: BnsService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? 'https://api.bns.xyz',
            VERSION: config?.VERSION ?? '0.1.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.backwardsCompatible = new BackwardsCompatibleService(this.request);
        this.bns = new BnsService(this.request);
    }
}

