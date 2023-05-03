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
import { PNG, findIDATChunks } from '../src/png';
import { readFile, writeFile } from 'fs/promises';
import * as P from 'micro-packed';

test('can decode a png', async () => {
  const file = await readFile('./data/card.png');
  const png = PNG.decode(file);
  const debug = P.debug(Chunk);
  // png.chunks.forEach(c => {
  //   debug.encode(c);
  // });
  // debug.decode(file);
});

test('decoding with itxt', async () => {
  const file = await readFile('./data/card2.png');
  const png = PNG.decode(file);
  const debug = P.debug(Chunk);
  png.chunks.forEach(c => {
    console.log(decodeChunk(c));
  });
});

test('writing a chunk', async () => {
  const file = await readFile('./data/card.png');
  const png = PNG.decode(file);
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
  const file = await readFile('./data/card4.png');
  const png = PNG.decode(file);
  png.chunks.forEach(c => {
    const chunk = decodeChunk(c);
    if (chunk.dataType === 'tEXt') {
      expect(chunk.decoded.keyword).toEqual('testpacked');
      expect(chunk.decoded.value).toEqual('testpackedvalue');
    }
  });
});

test('validating crc', async () => {
  const file = await readFile('./data/card4.png');
  const png = PNG.decode(file);
  png.chunks.forEach(c => {
    try {
      validateCrc(c);
    } catch (error) {
      throw new Error(`Found invalid CRC in chunk with type ${c.type}`);
    }
  });
});
