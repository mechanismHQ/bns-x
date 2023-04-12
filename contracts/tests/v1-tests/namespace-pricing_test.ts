import {
  describe,
  bns,
  it,
  deployWithNamespace,
  deployer,
  contracts,
  deploy,
  asciiToBytes,
  bytesToHex,
} from '../helpers.ts';

describe('namespace prices', () => {
  const { chain } = deployWithNamespace();

  it('fetch a namespace price', () => {
    const namespace = 'testable';
    console.log(bytesToHex(asciiToBytes(namespace)));

    const price = chain.rovOk(bns.getNamespacePrice(asciiToBytes(namespace)));

    // console.log("ustx", price);
    // console.log("price", Number(price) / 1000000);
  });

  it('testing price function', () => {
    const price = chain.rov(
      contracts.bnsV1.computeNamePrice({
        name: asciiToBytes('aaa'),
        priceFunction: {
          base: 1000n,
          buckets: [1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n, 1n],
          coeff: 10n,
          noVowelDiscount: 1n,
          nonalphaDiscount: 1n,
        },
      })
    );

    console.log('name price', price);
  });
});
