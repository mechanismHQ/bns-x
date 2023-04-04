import BigNumber from 'bignumber.js';
import type { IntegerType } from 'micro-stacks/common';
import { asciiToBytes } from 'micro-stacks/common';
import { bytesToAscii, hexToBytes } from 'micro-stacks/common';
import type { Name, NameBuff, WithCombined } from '@common/types';
import type { StacksNetwork } from 'micro-stacks/network';
import { bufferCV, tupleCV } from 'micro-stacks/clarity';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function intToString(int: IntegerType) {
  const str = typeof int === 'bigint' ? int.toString() : String(int);
  return str;
}

export function shiftInt(int: IntegerType, shift: number) {
  return new BigNumber(intToString(int)).shiftedBy(shift);
}

export function convertNameBuff<T extends NameBuff>(nameObj: T): WithCombined<T> {
  const { name: nameB, namespace: ns, ...rest } = nameObj;
  const name = bytesToAscii(nameB);
  const namespace = bytesToAscii(ns);
  return {
    name,
    namespace,
    combined: `${name}.${namespace}`,
    ...rest,
  } as WithCombined<T>;
}

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

export function fqn(name: Name) {
  return `${name.name}.${name.namespace}`;
}

export function getTxUrl(txId: string, network: StacksNetwork) {
  const coreUrl = network.getCoreApiUrl();
  const id = getTxId(txId);
  if (coreUrl.includes('http://localhost')) {
    return `http://localhost:8000/txid/${id}?chain=testnet`;
  }
  const chain = coreUrl.includes('testnet') ? 'testnet' : 'mainnet';
  return `https://explorer.stacks.co/txid/${id}?chain=${chain}`;
}

// Add 0x to beginning of txid
export function getTxId(txId: string) {
  return txId.startsWith('0x') ? txId : `0x${txId}`;
}

/**
 * truncateMiddle
 *
 * If contract_id, it will truncate the principal, while keeping the contract name untouched.
 * If prefixed with '0x', will truncate everything after prefix.
 *
 * @param input - the string to truncate
 * @param offset - the number of chars to keep on either end
 */
export function truncateMiddle(input: string, offset = 5): string {
  if (!input) return '';
  // hex
  // if (input.startsWith('0x')) {
  //   return truncateHex(input, offset);
  // }
  // for contracts
  if (input.includes('.')) {
    const parts = input.split('.');
    const start = parts[0]?.substr(0, offset);
    const end = parts[0]?.substr(parts[0].length - offset, parts[0].length);
    return `${start || ''}…${end || ''}.${parts[1] || ''}`;
  } else {
    // everything else
    const start = input?.substr(0, offset);
    const end = input?.substr(input.length - offset, input.length);
    return `${start}…${end}`;
  }
}

export function getContractParts(identifier: string): [string, string] {
  const [addr, name] = identifier.split('.');
  if (!addr || !name) {
    throw new Error(`Invalid contract ID: ${identifier}`);
  }
  return [addr, name];
}

export function nameToTupleCV(fqn: string) {
  const [name, namespace] = getContractParts(fqn);
  return tupleCV({
    name: bufferCV(asciiToBytes(name)),
    namespace: bufferCV(asciiToBytes(namespace)),
  });
}

export function nameToTupleBytes(fqn: string) {
  const [name, namespace] = getContractParts(fqn);
  return {
    name: asciiToBytes(name),
    namespace: asciiToBytes(namespace),
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
