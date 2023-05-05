import { inflate, deflate } from 'pako';
import type { DecodedZTXTChunk } from './png';
import { makeChunk, zTXtChunkData } from './png';
import type * as P from 'micro-packed';

export function decompressZTXt(data: P.UnwrapCoder<typeof zTXtChunkData>) {
  if (data.compressionMethod !== 0) {
    throw new Error('Unsupported compression method');
  }
  const decompressed = inflate(data.value);
  return decompressed;
}

export function makeZTXtChunk(keyword: string, value: Uint8Array) {
  const compressed = deflate(value);
  const data = zTXtChunkData.encode({
    keyword,
    compressionMethod: 0,
    value: compressed,
  });
  return makeChunk('zTXt', data);
}
