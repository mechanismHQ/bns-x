import { test, expect } from 'vitest';
import { BnsContractsClient } from '../src';
import { ALL_NAMESPACES, computeNamePrice } from '@bns-x/core';

const validAsciiCharsStr = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
export const validAsciiChars = validAsciiCharsStr.split('');

const maxAsciiSize = 48;
export function randomName({
  length,
  allowInvalid,
}: {
  length?: number;
  allowInvalid?: boolean;
} = {}) {
  const len = length || Math.floor(Math.random() * maxAsciiSize + 1);
  let name = '';
  for (let i = 0; i < len; i++) {
    const charIndex = Math.floor(Math.random() * validAsciiChars.length);
    const char = validAsciiChars[charIndex];
    name += char;
  }
  return name;
}

const client = new BnsContractsClient('mainnet');

test('stx pricing is correct', async () => {
  const numTests = 10;
  for (let i = 0; i < numTests; i++) {
    const name = randomName();
    const price = computeNamePrice(name, 'stx');
    const realPrice = await client.computeNamePrice(name, 'stx');
    expect(realPrice).toEqual(price);
  }
});
