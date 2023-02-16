import { DEFAULT_API_URL } from './constants';
import type { TrpcClient } from './trpc';
import { trpcClient } from './trpc';
import type { NameInfoResponse, NamesByAddressResponse } from '../routes/api-types';
import { getContractParts } from '../utils';

export class BnsxApiClient {
  /** @hidden */
  public trpc: TrpcClient;

  /**
   * Create an API client
   *
   * @param baseUrl An optional URL to use for API queries. Defaults
   * to `https://api.bns.xyz`
   */
  constructor(baseUrl = DEFAULT_API_URL) {
    this.trpc = trpcClient(baseUrl);
  }

  async getNamesOwnedByAddress(address: string): Promise<NamesByAddressResponse> {
    return this.trpc.getAddressNames.query(address);
  }

  /**
   * Returns a simple "display name" for an address. If your app only needs to show
   * a single BNS name for a specific address, use this function.
   *
   * @example
   * ```ts
   * const name = await api.getDisplayName(address);
   * console.log(name); // "example.btc"
   * ```
   * @param address
   * @returns
   */
  async getDisplayName(address: string): Promise<string | null> {
    const { name } = await this.trpc.getDisplayName.query(address);
    return name;
  }

  async getLegacyName(address: string): Promise<NamesByAddressResponse['legacy']> {
    return (await this.getNamesOwnedByAddress(address)).legacy;
  }

  /**
   * Fetch information about a name
   *
   * @example
   * ```ts
   * await api.getNameDetails('example', 'btc')
   * ```
   *
   * @param name
   * @param namespace
   * @returns
   */
  async getNameDetails(name: string, namespace: string): Promise<NameInfoResponse | null> {
    try {
      return this.trpc.getNameDetails.query({ name, namespace });
    } catch (error) {
      return null;
    }
  }

  /**
   * Similar to {@link BnsxApiClient.getNameDetails}, but with a helper
   * for passing a fully qualified name
   *
   * @example
   * ```ts
   * await api.getNameDetailsFromFqn('example.btc')
   * ```
   *
   * @param fqn
   * @returns
   */
  async getNameDetailsFromFqn(fqn: string) {
    const [name, namespace] = getContractParts(fqn);
    return this.getNameDetails(name, namespace);
  }
}
