import {
  Chunk,
  PNGFile,
  iTXtChunkData,
  zTXtChunkData,
  tEXtChunkData,
  decodeChunk,
  validateCrc,
  makeTEXTChunk,
  appendChunk,
} from '../src/png';
import { hashPNG, idatBytes } from '../src/hash';
import { PNG, findIDATChunks } from '../src/png';
import { readFile, writeFile } from 'fs/promises';
import * as P from 'micro-packed';
import { readPng } from './helpers';
import { test, expect } from 'vitest';
import { createVerificationChunk, makeZTXtChunk } from '../src';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

test('can decode a png', async () => {
  const png = await readPng('./data/card.png');
  const debug = P.debug(Chunk);
});

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
  const expected = hexToBytes('e230ac890d2bb7cf5c0cb1d59fbe74ec42956c89d2207838682d5e0e4ea4ad83');
  expect(P.equalBytes(hash, expected)).toEqual(true);
});

test('idatBytes', async () => {
  const png = await readPng('./data/screenshot1.png');
  const bytes = idatBytes(png);
  expect(bytes.length).toEqual(361630);
});

test('hashing png removes verification chunk', async () => {
  const png = await readPng('./data/card.png');
  const initHash = hashPNG(png);
  const newChunk = createVerificationChunk('STX', new Uint8Array([]));
  appendChunk(png, newChunk);
  const hash = hashPNG(png);
  expect(P.equalBytes(hash, initHash)).toEqual(true);
});

test('hashing includes non-verification chunks', async () => {
  const png = await readPng('./data/card.png');
  const initHash = hashPNG(png);
  const newChunk = makeZTXtChunk('something', hexToBytes('deadbeef'));
  appendChunk(png, newChunk);
  const hash = hashPNG(png);
  expect(P.equalBytes(hash, initHash)).toEqual(false);
});
