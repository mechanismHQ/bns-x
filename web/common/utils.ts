import BigNumber from 'bignumber.js';
import { bytesToAscii, hexToBytes, IntegerType } from 'micro-stacks/common';
import { Name, NameBuff, WithCombined } from '@common/types';
import { StacksNetwork } from 'micro-stacks/network';

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
