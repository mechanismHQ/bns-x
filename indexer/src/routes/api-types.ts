import {
  BnsGetNameInfoResponse,
  BnsNamesOwnByAddressResponse,
} from "@stacks/stacks-blockchain-api-types";
import { LegacyDetails } from "../contracts/types";

export interface NameInfoResponseLegacy extends BnsGetNameInfoResponse {
  isBnsx: false;
}

export interface NameInfoResponseBnsx extends BnsGetNameInfoResponse {
  isBnsx: true;
  id: string;
  legacy: LegacyDetails | null;
}

export type NameInfoResponse = NameInfoResponseLegacy | NameInfoResponseBnsx;

export interface NamesByAddressResponse extends BnsNamesOwnByAddressResponse {
  primary_name: string;
}
