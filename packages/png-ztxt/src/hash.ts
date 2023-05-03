import { sha256 } from '@noble/hashes/sha256';
import type { PNGFile } from './png';
import { PNG } from './png';
import { concatBytes } from 'micro-packed';

/**
 * Calculate the sha256 hash of all IDAT chunks
 */
export function hashPNG(file: PNGFile) {
  return sha256(idatBytes(file));
}

export function idatBytes(file: PNGFile) {
  const bytes = file.chunks.reduce((acc, c) => {
    if (c.type === 'IDAT') {
      return concatBytes(acc, c.data);
    }
    return acc;
  }, new Uint8Array([]));
  return bytes;
}
