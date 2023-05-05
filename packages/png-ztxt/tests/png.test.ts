import {
  Chunk,
  PNGFile,
  iTXtChunkData,
  zTXtChunkData,
  tEXtChunkData,
  decodeChunk,
  validateCrc,
  makeTEXTChunk,
} from '../src/png';
import { hashPNG, idatBytes } from '../src/hash';
import { PNG, findIDATChunks } from '../src/png';
import { readFile, writeFile } from 'fs/promises';
import * as P from 'micro-packed';
import { readPng } from './helpers';
import { test, expect } from 'vitest';

test('can decode a png', async () => {
  const png = await readPng('./data/card.png');
  const debug = P.debug(Chunk);
  // png.chunks.forEach(c => {
  //   debug.encode(c);
  // });
  // debug.decode(file);
});

// test('decoding with itxt', async () => {
//   const png = await readPng('./data/screenshot1.png');
//   const debug = P.debug(Chunk);
//   png.chunks.forEach(c => {
//     console.log(decodeChunk(c));
//   });
// });

test('writing a chunk', async () => {
  const png = await readPng('./data/card.png');
  const chunk = makeTEXTChunk({
    keyword: 'testpacked',
    value: 'testpackedvalue',
  });
  png.chunks.splice(png.chunks.length - 2, 0, chunk);
  const newFile = PNG.encode(png);
  await writeFile('./data/card4.png', newFile);
  png.chunks.forEach(validateCrc);
});

test('creating chunks', () => {
  const textChunk = makeTEXTChunk({ keyword: 'test', value: 'testvalue' });
  validateCrc(textChunk);
  expect(textChunk.type).toEqual('tEXt');
  const textChunkData = tEXtChunkData.encode({ keyword: 'test', value: 'testvalue' });
  expect(P.equalBytes(textChunkData, textChunk.data)).toEqual(true);
});

test('reading a chunk just written', async () => {
  const png = await readPng('./data/card4.png');
  png.chunks.forEach(c => {
    const chunk = decodeChunk(c);
    if (chunk.dataType === 'tEXt') {
      expect(chunk.decoded.keyword).toEqual('testpacked');
      expect(chunk.decoded.value).toEqual('testpackedvalue');
    }
  });
});

test('validating crc', async () => {
  const png = await readPng('./data/card4.png');
  png.chunks.forEach(c => {
    try {
      validateCrc(c);
    } catch (error) {
      throw new Error(`Found invalid CRC in chunk with type ${c.type}`);
    }
  });
});

test('hashing png', async () => {
  const png = await readPng('./data/screenshot1.png');
  const hash = hashPNG(png);
  const expected = new Uint8Array([
    137, 100, 114, 217, 13, 130, 222, 141, 44, 10, 39, 230, 69, 137, 6, 87, 77, 96, 255, 94, 115,
    148, 32, 217, 59, 97, 125, 251, 79, 124, 92, 51,
  ]);
  expect(P.equalBytes(hash, expected)).toEqual(true);
});

test('idatBytes', async () => {
  const png = await readPng('./data/screenshot1.png');
  const bytes = idatBytes(png);
  expect(bytes.length).toEqual(361630);
});
