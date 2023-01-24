import { bytesToAscii, hexToBytes } from "micro-stacks/common";
import {
  WithCombined,
  NameBuff,
  NameBase,
  LegacyDetails,
  LegacyJson,
} from "./types";

export function bytesToName(input: string | Uint8Array) {
  if (typeof input === "string") {
    return bytesToAscii(hexToBytes(input));
  }
  return bytesToAscii(input);
}

export function convertNameBuff<T extends NameBuff | NameBase>(
  nameObj: T
): WithCombined<T> {
  const { name: nameB, namespace: ns, ...rest } = nameObj;
  const name = bytesToName(nameB);
  const namespace = bytesToName(ns);
  return {
    name,
    namespace,
    combined: `${name}.${namespace}`,
    ...rest,
  } as WithCombined<T>;
}

export function convertLegacyDetailsJson<T extends LegacyJson>(
  details: T | null
): (T & LegacyDetails) | null {
  if (details === null) return null;
  return {
    ...details,
    leaseEndingAt:
      details.leaseEndingAt === null ? null : Number(details.leaseEndingAt),
    leaseStartedAt: Number(details.leaseStartedAt),
  };
}
