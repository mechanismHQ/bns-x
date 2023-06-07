import { bytesToAscii, hexToBytes, bytesToHex, asciiToBytes } from 'micro-stacks/common';
import type { WithCombined, NameBuff, NameBase, LegacyDetails, LegacyJson } from './types';
import { toUnicode } from '@bns-x/punycode';
import { hashRipemd160, getRandomBytes } from 'micro-stacks/crypto';
import { createHash } from 'crypto';

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

/**
 * Computes the RIPEMD-160 hash of the SHA-256 hash of a string.
 * The input string is first hashed using the SHA-256 algorithm.
 * The resulting SHA-256 hash is then hashed using the RIPEMD-160 algorithm.
 * The final hash value is returned as a Uint8Array.
 * @param data - The string to hash.
 * @returns A Uint8Array containing the RIPEMD-160 hash of the SHA-256 hash of the input string.
 */
export function hash160(data: string) {
  // Compute the SHA-256 hash of the input string.
  const sha256 = createHash('sha256').update(data).digest();

  // Compute the RIPEMD-160 hash of the SHA-256 hash.
  const ripe160 = createHash('ripemd160').update(sha256).digest();

  // Return the resulting hash value as a Uint8Array.
  return new Uint8Array(ripe160);
}

/**
 * Converts a hexadecimal string to a regular string.
 * Each pair of hexadecimal characters in the input string is converted to a Unicode character.
 * @param hex - The hexadecimal string to convert to a regular string.
 * @returns A regular string corresponding to the input hexadecimal string.
 */
export function hexToString(hex: any) {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    // Convert each pair of hexadecimal characters to a Unicode character.
    const charCode = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(charCode);
  }
  // Return the resulting regular string.
  return str;
}

/**
 * Computes the hash of a fully qualified name (FQN) with a salt value.
 * The FQN is constructed by concatenating the name, namespace, and salt values.
 * The resulting FQN string is then hashed using the hash160 function.
 * @param name - The name of the domain being hashed.
 * @param namespace - The namespace of the domain being hashed.
 * @param salt - The salt value to use in the hash computation.
 * @returns A Uint8Array containing the hash value of the FQN with salt.
 */
export function hashFqn(name: string, namespace: string, salt: string | Uint8Array) {
  // Convert the salt value to a hexadecimal string if it's not already in that format.
  const saltHex = typeof salt === 'string' ? salt : bytesToHex(salt);

  // Convert the name and namespace values to hexadecimal strings.
  const nameBytes = asciiToHex(name);
  const namespaceBytes = asciiToHex(namespace);

  // Concatenate the name, namespace, and salt values to form the fully qualified name (FQN) with salt.
  const fqnWithSalt = `${nameBytes}2e${namespaceBytes}${saltHex}`;

  // Convert the FQN with salt from hexadecimal to a regular string.
  const fqnWithSaltString = hexToString(fqnWithSalt);

  // Compute the hash of the FQN with salt using the hash160 function.
  return hash160(fqnWithSaltString);
}

export const NO_EXPIRATION_NAMESPACES = new Set([
  'stx',
  'app',
  'stacks',
  'podcast',
  'miner',
  'mining',
  'helloworld',
  'stacking',
  'blockstack',
]);

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
  return !NO_EXPIRATION_NAMESPACES.has(namespace);
}
