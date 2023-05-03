import * as P from 'micro-packed';
import { type } from 'os';

const ChunkData = P.struct({
  keywordLength: P.U8,
  compressionFlag: P.U8,
  keyword: P.string('keywordLength'),
  value: P.bytes('length'),
});

export const iTXtChunkData = P.struct({
  keyword: P.cstring,
  compressionFlag: P.U16BE,
  compressionMethod: P.U8,
  language: P.cstring,
  value: P.string(null),
});

export const zTXtChunkData = P.struct({
  keyword: P.cstring,
  compressionMethod: P.U8,
  value: P.string(null),
});

export const tEXtChunkData = P.struct({
  keyword: P.cstring,
  value: P.string(null),
});

export type TextChunk = P.UnwrapCoder<typeof iTXtChunkData>;

export type AnyChunk =
  | P.UnwrapCoder<typeof Chunk>
  | P.UnwrapCoder<typeof iTXtChunkData>
  | P.UnwrapCoder<typeof zTXtChunkData>
  | P.UnwrapCoder<typeof tEXtChunkData>;

export type ChunkType = P.UnwrapCoder<typeof Chunk>;

// Chunk structure
export const Chunk = P.struct({
  length: P.U32BE,
  type: P.string(4),
  data: P.bytes('length'),
  crc: P.U32BE,
});

// PNG file structure
export const PNG = P.struct({
  signature: P.magicBytes(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])),
  chunks: P.array(null, Chunk),
});

export type PNGFile = P.UnwrapCoder<typeof PNG>;

// Function to find all IDAT chunks
export function findIDATChunks(file: PNGFile) {
  // return file.chunks.filter(chunk => chunk.data.TAG === 'IDAT');
  return file.chunks.filter(chunk => chunk.type === 'IDAT');
}

export function makeChunk(type: string, data: Uint8Array): ChunkType {
  const crc = calcCrc(type, data);
  return {
    length: data.length,
    type,
    crc,
    data,
  };
}

export function makeTEXTChunk({ keyword, value }: { keyword: string; value: string }): ChunkType {
  const data = tEXtChunkData.encode({
    keyword,
    value,
  });
  return makeChunk('tEXt', data);
}

export function appendChunk(file: PNGFile, chunk: ChunkType) {
  file.chunks.splice(file.chunks.length - 2, 0, chunk);
}

type DecodedTextChunk<Type extends string, Coder> = {
  decoded: P.UnwrapCoder<Coder>;
  dataType: Type;
  type: Type;
  data: Uint8Array;
};

type DecodedITXTChunk = DecodedTextChunk<'iTXt', typeof iTXtChunkData>;
type DecodedZTXTChunk = DecodedTextChunk<'zTXt', typeof zTXtChunkData>;
type DecodedTEXTChunk = DecodedTextChunk<'tEXt', typeof tEXtChunkData>;

type DecodedChunk =
  | DecodedITXTChunk
  | DecodedTEXTChunk
  | DecodedZTXTChunk
  | {
      dataType: 'other';
      data: Uint8Array;
      type: string;
      decoded?: undefined;
    };

export function decodeChunk(chunk: ChunkType): DecodedChunk {
  switch (chunk.type) {
    case 'iTXt':
      return {
        decoded: iTXtChunkData.decode(chunk.data),
        dataType: 'iTXt',
        type: 'iTXt',
        data: chunk.data,
      };
    case 'zTXt':
      return {
        decoded: zTXtChunkData.decode(chunk.data),
        dataType: 'zTXt',
        type: 'zTXt',
        data: chunk.data,
      };
    case 'tEXt':
      return {
        decoded: tEXtChunkData.decode(chunk.data),
        dataType: 'tEXt',
        type: 'tEXt',
        data: chunk.data,
      };
    default:
      return {
        dataType: 'other',
        type: chunk.type,
        data: chunk.data,
      };
  }
}

// CRC
const table = new Uint32Array(256);

// Precompute the CRC table
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    crc = (crc >>> 1) ^ ((crc & 1) * 0xedb88320);
  }
  table[i] = crc >>> 0;
}

export function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export function calcCrc(type: Uint8Array | string, data: Uint8Array) {
  const typeBytes = typeof type === 'string' ? new TextEncoder().encode(type) : type;
  const bytes = new Uint8Array([...typeBytes, ...data]);
  return crc32(bytes);
}

export function validateCrc(chunk: ChunkType) {
  const crc = calcCrc(chunk.type, chunk.data);
  if (crc !== chunk.crc) {
    throw new Error('Invalid CRC');
  }
}
