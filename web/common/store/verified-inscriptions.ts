import { atom } from 'jotai';
import { bytesToBase64, hexToBytes } from 'micro-stacks/common';
import type { PNGFile, Verification } from '@bns-x/png';
import { getPngVerifications } from '@bns-x/png';
import { hashPNG, PNG, appendChunk, createVerificationChunk } from '@bns-x/png';
import { atomFamily } from 'jotai/utils';
import { dequal } from 'dequal';
import { addressDisplayNameState } from '@store/api';

export const pngBytesAtom = atom<Uint8Array | null>(null);

export const pngAtom = atom(get => {
  const bytes = get(pngBytesAtom);
  if (bytes === null) return null;
  console.log('setting png');
  return PNG.decode(bytes);
});

export const pngHashAtom = atom(get => {
  const png = get(pngAtom);
  if (png === null) return null;
  console.log('hashing png');
  return hashPNG(png);
});

export const pngSignatureAtom = atom('');

export const verifiedPngAtom = atom<PNGFile | null>(null);

export const pngVerificationsState = atom(get => {
  const png = get(verifiedPngAtom);
  if (!png) return [];
  return getPngVerifications(png);
});

export const verifiedPngDataState = atom(get => {
  const png = get(verifiedPngAtom);
  if (!png) return null;
  const bytes = bytesToBase64(PNG.encode(png));
  return `data:image/png;base64,${bytes}`;
});

export const verificationNameState = atomFamily((verification: Verification) => {
  return atom(get => {
    if (verification.protocol.toLowerCase() === 'stx') {
      const name = get(addressDisplayNameState(verification.address));
      return name;
    }
    return null;
  });
}, dequal);
