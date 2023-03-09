import { bytesToAscii, hexToBytes, bytesToHex, asciiToBytes } from 'micro-stacks/common';
import type { WithCombined, NameBuff, NameBase, LegacyDetails, LegacyJson } from './types';
import { toUnicode } from 'punycode';
import { hashRipemd160, getRandomBytes } from 'micro-stacks/crypto';

export function getContractParts(identifier: string): [string, string] {
  const [addr, name] = identifier.split('.');
  if (!addr || !name) {
    throw new Error(`Invalid contract ID: ${identifier}`);
  }
  return [addr, name];
}

export function asciiToHex(str: string) {
  return bytesToHex(asciiToBytes(str));
}

export function hexToAscii(str: string) {
  return bytesToAscii(hexToBytes(str));
}

export function bytesToName(input: string | Uint8Array) {
  if (typeof input === 'string') {
    return bytesToAscii(hexToBytes(input));
  }
  return bytesToAscii(input);
}

export function convertNameBuff<T extends NameBuff | NameBase>(nameObj: T): WithCombined<T> {
  const { name: nameB, namespace: ns, ...rest } = nameObj;
  const name = bytesToName(nameB);
  const namespace = bytesToName(ns);
  const combined = `${name}.${namespace}`;
  return {
    name,
    namespace,
    combined,
    decoded: toUnicode(combined),
    ...rest,
  } as WithCombined<T>;
}

export function convertLegacyDetailsJson<T extends LegacyJson>(
  details: T | null
): (T & LegacyDetails) | null {
  if (details === null) return null;
  return {
    ...details,
    leaseEndingAt: details.leaseEndingAt === null ? null : Number(details.leaseEndingAt),
    leaseStartedAt: Number(details.leaseStartedAt),
  };
}

export function getNameParts(fqn: string) {
  const parts = fqn.split('.');
  if (parts.length === 3) {
    return parts.slice(1) as [string, string];
  }
  if (parts.length !== 2) {
    throw new Error(`Invalid FQN. Received: ${fqn}`);
  }

  return parts as [string, string];
}

export interface ParsedName {
  subdomain?: string;
  name: string;
  namespace: string;
}

export function parseFqn(fqn: string): ParsedName {
  const parts = fqn.split('.');
  if (parts.length === 3) {
    const [subdomain, name, namespace] = parts as [string, string, string];
    return {
      subdomain,
      name,
      namespace,
    };
  }
  if (parts.length === 2) {
    const [name, namespace] = parts as [string, string];
    return {
      name,
      namespace,
    };
  }
  throw new Error(`Invalid name: ${fqn}`);
}

export function randomSalt() {
  return getRandomBytes(20);
}

export function hashFqn(name: string, namespace: string, salt: string | Uint8Array) {
  const saltHex = typeof salt === 'string' ? salt : bytesToHex(salt);
  const nameBytes = asciiToHex(name);
  const namespaceBytes = asciiToHex(namespace);
  return hashRipemd160(hexToBytes(`${nameBytes}2e${namespaceBytes}${saltHex}`));
}

export const NO_EXPIRATION_NAMESPACES = new Set(
  ...['stx', 'app', 'stacks', 'podcast', 'miner', 'mining', 'helloworld', 'stacking', 'blockstack']
);

/**
 * Helper function to expose namespaces that do not expire.
 *
 * **Note**: This is a hard-coded list. If new namespaces are registered, they
 * are not automatically added to this list.
 *
 * If you want to fetch on-chain data, use `BnsContractsClient#fetchNamespaceExpiration`.
 *
 */
export function doesNamespaceExpire(namespace: string) {
  return NO_EXPIRATION_NAMESPACES.has(namespace);
}
