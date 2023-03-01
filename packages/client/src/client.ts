import { DEFAULT_API_URL } from './constants';
import type { NameInfoResponse, NamesByAddressResponse } from '@bns-x/core';
import { BNS } from './generated';

export class BnsApiClient {
  public openapi: BNS;

  /**
   * Create an API client
   *
   * @param baseUrl An optional URL to use for API queries. Defaults
   * to `https://api.bns.xyz`
   */
  constructor(baseUrl = DEFAULT_API_URL) {
    this.openapi = new BNS({
      BASE: baseUrl,
    });
  }

  async getNamesOwnedByAddress(address: string): Promise<NamesByAddressResponse> {
    return this.openapi.bns.getBnsAddressesStacks(address);
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
    const { names } = await this.openapi.backwardsCompatible.getV1AddressesStacks(address);
    return names[0] ?? null;
  }

  async getCoreName(address: string): Promise<NamesByAddressResponse['coreName']> {
    return (await this.getNamesOwnedByAddress(address)).coreName;
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
    return this.getNameDetailsFromFqn(`${name}.${namespace}`);
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
    try {
      const details = await this.openapi.backwardsCompatible.getV1Names(fqn);
      return details as unknown as NameInfoResponse;
    } catch (error) {
      return null;
    }
  }
}
