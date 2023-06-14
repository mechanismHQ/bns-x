import { BnsApiClient } from '../src';
import { expect, test } from 'vitest';

const api = new BnsApiClient();

test('can fetch name details two different ways', async () => {
  const [nameA, nameB] = await Promise.all([
    api.getNameDetails('hello-bnsx', 'btc'),
    api.getNameDetails('hello-bnsx.btc'),
  ]);

  expect(nameA).toEqual(nameB);
});
