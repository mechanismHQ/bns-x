import { test, expect } from 'vitest';

import { Chunk, createVerificationChunk, recoverStacksAddress } from '../src';
import { hexToBytes } from '@noble/hashes/utils';

const hash = 'd51ea00e30106ed08cb7e48b6eaf752d843e217d9e7085bcf402c9176d5ba229';
const signature =
  '83a92c25b4463ee3ce075a1845bacf8d4d7ca8baf9fe7697460fb5b5afb3e613651dc81480ea9abdbcf20121a5957784d676ae257749ed28ce26ed81617cc8c401';

test('can recover stacks address correctly', () => {
  const address = recoverStacksAddress(hexToBytes(signature), hexToBytes(hash));
  expect(address).toEqual('SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2XG1V316');
});

test('creating a signature chunk', async () => {
  const chunk = createVerificationChunk('STX', hexToBytes(signature));
  const chunkBytes = Chunk.encode(chunk);
  expect(chunkBytes.length).toEqual(115);
});
