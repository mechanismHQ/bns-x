import type {
  NameInfoResponse,
  NameStringsForAddressResponse,
  NamesByAddressResponse,
} from '@bns-x/core';

export abstract class BaseFetcher {
  /**
   * Return either a BNSx name, a BNS name, or a BNS subdomain (in that order)
   * @param address
   */
  abstract getDisplayName(address: string): Promise<string | null>;

  abstract getNameDetails(fqn: string): Promise<NameInfoResponse | null>;

  abstract getAddressNames(address: string): Promise<NamesByAddressResponse>;

  abstract getAddressNameStrings(address: string): Promise<NameStringsForAddressResponse>;

  abstract getCoreName(address: string): Promise<string | null>;
}
