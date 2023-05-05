import { sha256 } from '@noble/hashes/sha256';
import type { PNGFile } from './png';
import { zTXtChunkData } from './png';
import { PNG } from './png';
import { concatBytes } from 'micro-packed';
import { VERIFIED_INSCRIPTION_KEYWORD } from './sig';

/**
 * Calculate the sha256 hash of all IDAT chunks
 */
export function hashPNG(file: PNGFile) {
  return sha256(removeVerificationChunks(file));
}

export function removeVerificationChunks(pngOrBytes: PNGFile | Uint8Array) {
  const png = pngOrBytes instanceof Uint8Array ? PNG.decode(pngOrBytes) : pngOrBytes;
  const chunks = png.chunks.filter(chunk => {
    if (chunk.type !== 'zTXt') return true;
    const decoded = zTXtChunkData.decode(chunk.data);
    return decoded.keyword !== VERIFIED_INSCRIPTION_KEYWORD;
  });
  return PNG.encode({
    chunks,
  });
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
