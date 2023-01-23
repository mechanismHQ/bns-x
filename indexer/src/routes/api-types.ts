import {
  BnsGetNameInfoResponse,
  BnsNamesOwnByAddressResponse,
} from "@stacks/stacks-blockchain-api-types";

export interface NameInfoResponseLegacy extends BnsGetNameInfoResponse {
  is_bnsx: false;
}

export interface NameInfoResponseBnsx extends BnsGetNameInfoResponse {
  is_bnsx: true;
  nft_id: number;
}

export type NameInfoResponse = NameInfoResponseLegacy | NameInfoResponseBnsx;

export interface NamesByAddressResponse extends BnsNamesOwnByAddressResponse {
  primary_name: string;
}
