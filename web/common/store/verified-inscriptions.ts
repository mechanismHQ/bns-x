import { atom } from 'jotai';
import type { PNGFile, Verification } from '@bns-x/png';
import { getPngVerifications } from '@bns-x/png';
import { hashPNG, PNG } from '@bns-x/png';
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

function imageBlob(bytes: Uint8Array) {
  const blob = new Blob([bytes], { type: 'image/png' });
  return URL.createObjectURL(blob);
}

export const verifiedPngDataState = atom(get => {
  const png = get(verifiedPngAtom);
  if (!png) return null;
  const blob = new Blob([PNG.encode(png)], { type: 'image/png' });
  return URL.createObjectURL(blob);
});

export const imageDataState = atom(get => {
  const verified = get(verifiedPngAtom);
  if (verified !== null) {
    return imageBlob(PNG.encode(verified));
  }
  const basePng = get(pngBytesAtom);
  if (basePng === null) return null;
  return imageBlob(basePng);
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

export const isFetchingExampleAtom = atom(false);
