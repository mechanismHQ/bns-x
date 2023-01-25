import { makeNameWrapper } from '../common/wrapper';
import { getContracts, getNetworkKey } from '../common/constants';

test('works for different environments', () => {
  process.env.NEXT_PUBLIC_NETWORK_KEY = 'testnet';

  const code = makeNameWrapper();

  expect(code.includes('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM')).toBeFalsy();
});
