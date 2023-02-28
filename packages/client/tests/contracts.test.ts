import { asciiToBytes } from 'micro-stacks/common';
import { BnsContractsClient, hashFqn, randomSalt } from '../src';

const client = new BnsContractsClient('devnet');
const core = client.bnsCore;

test('can get name wrapper code', () => {
  const wrapper = client.nameWrapperCode;

  expect(wrapper.includes('(define-public (unwrap')).toBeTruthy();
});

test('config is correct', () => {
  expect(client.isMainnet).toBeFalsy();
});

test('code samples', async () => {
  const price = 200n;
  expect(
    core.namePreorder({
      stxToBurn: price,
      hashedSaltedFqn: hashFqn('example', 'btc', randomSalt()),
    })
  ).toBeTruthy();

  core.nameRegister({
    namespace: asciiToBytes('btc'),
    name: asciiToBytes('example'),
    salt: randomSalt(),
    zonefileHash: new Uint8Array(),
  });
});
