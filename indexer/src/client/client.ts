import { DEFAULT_API_URL } from './constants';
import type { TrpcClient } from './trpc';
import { trpcClient } from './trpc';
import type { DeploymentNetwork } from '@clarigen/core';
import type { NameInfoResponse } from '../routes/api-types';
import { getContractParts } from '../utils';

export class BnsxApiClient {
  public trpc: TrpcClient;

  constructor(baseUrl = DEFAULT_API_URL) {
    this.trpc = trpcClient(baseUrl);
  }

  async getNamesOwnedByAddress(address: string) {
    return this.trpc.getAddressNames.query(address);
  }

  async getDisplayName(address: string) {
    const { displayName } = await this.getNamesOwnedByAddress(address);
    return displayName;
  }

  async getLegacyName(address: string) {
    return (await this.getNamesOwnedByAddress(address)).legacy;
  }

  async getNameDetails(name: string, namespace: string): Promise<NameInfoResponse> {
    return this.trpc.getNameDetails.query({ name, namespace });
  }

  async getNameDetailsFromFqn(fqn: string) {
    const [name, namespace] = getContractParts(fqn);
    return this.getNameDetails(name, namespace);
  }
}
