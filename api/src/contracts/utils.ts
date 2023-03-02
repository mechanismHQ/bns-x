import { bytesToAscii, hexToBytes, intToBigInt } from 'micro-stacks/common';
import type { WithCombined, NameBuff, NameBase, LegacyDetails, LegacyJson } from './types';
import { toUnicode } from 'punycode';

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

export function convertDbName<T extends Omit<NameBase, 'id'> & { id: bigint }>(
  nameObj: T
): WithCombined<Omit<T, 'id'> & { id: number }> & { id: number } {
  return convertNameBuff({
    ...nameObj,
    id: Number(nameObj.id),
  });
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
