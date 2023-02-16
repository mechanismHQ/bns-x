import { BnsxContractsClient } from '../src/client/index';

test('works for different environments', () => {
  process.env.NEXT_PUBLIC_NETWORK_KEY = '';
  const code = new BnsxContractsClient('testnet').nameWrapperCode;

  expect(code.includes('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBeFalsy();
});

test('works on mainnet', () => {
  process.env.NEXT_PUBLIC_NETWORK_KEY = '';

  const code = new BnsxContractsClient('mainnet').nameWrapperCode;

  expect(code.includes('ST000')).toBeFalsy();
  expect(code.includes('SP000000000000000000002Q6VF78.bns')).toBeTruthy();
  expect(code.includes('SP000000000000000000002Q6VF78.bns.bns')).toBeFalsy();
  expect(code.includes('ST000000000000000000002AMW42H.bns')).toBeFalsy();
  expect(code.includes('SP1JTCR202ECC6333N7ZXD7MK7E3ZTEEE1MJ73C60')).toBeTruthy();
});
