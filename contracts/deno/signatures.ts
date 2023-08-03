import { hexToBytes } from '../deps.ts';
import { secp256k1 } from '../vendor/noble-curves/secp256k1.ts';

export const intToHexString = (integer: bigint, lengthBytes = 8): string => {
  return integer.toString(16).padStart(lengthBytes * 2, '0');
};

export const leftPadHexToLength = (hexString: string, length: number): string =>
  hexString.padStart(length, '0');

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

/**
 * NB: returns signature in format applicable to Clarity, not like
 * micro-stacks
 */
export function signWithKey(input: Uint8Array, privateKey: Uint8Array) {
  const signature = secp256k1.sign(input, privateKey);
  const sigHex = signature.toCompactHex();
  const recoveryParam = signature.recovery;
  if (recoveryParam === undefined || recoveryParam === null) {
    throw new Error('signature recoveryParam is not set');
  }
  const recoveryHex = intToHexString(BigInt(recoveryParam), 1);
  return hexToBytes(sigHex + recoveryHex);
}
