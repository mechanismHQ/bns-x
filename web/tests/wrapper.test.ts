import { makeNameWrapper } from '../common/wrapper';
import { getContracts, getNetworkKey } from '../common/constants';

test('works for different environments', () => {
  process.env.NEXT_PUBLIC_NETWORK_KEY = 'testnet';

  const code = makeNameWrapper();

  expect(code.includes('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBeFalsy();
});

test('works on mainnet', () => {
  process.env.NEXT_PUBLIC_NETWORK_KEY = 'mainnet';

  const code = makeNameWrapper();

  expect(code.includes('ST000')).toBeFalsy();
  expect(code.includes('SP000000000000000000002Q6VF78.bns')).toBeTruthy();
  expect(code.includes('SP000000000000000000002Q6VF78.bns.bns')).toBeFalsy();
  expect(code.includes('ST000000000000000000002AMW42H.bns')).toBeFalsy();
  expect(code.includes('SPRG2XNKCEV40EMASB8TG3B599ATHPRWRWSM4EB7')).toBeTruthy();
});
