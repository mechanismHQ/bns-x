import {
  BnsGetNameInfoResponse,
  BnsNamesOwnByAddressResponse,
} from "@stacks/stacks-blockchain-api-types";
import {
  FastifyInstance,
  FastifyBaseLogger,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  FastifyPluginCallback,
} from "fastify";
import { LegacyDetails } from "../contracts/types";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export type FastifyServer = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export type FastifyPlugin = FastifyPluginCallback<
  {},
  RawServerDefault,
  ZodTypeProvider
>;

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
