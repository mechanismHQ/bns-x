import {
  describe,
  hexToBytes,
  it,
  deployWithNamespace,
  contracts,
  alice,
  deployer,
  assertEquals,
  asciiToBytes,
  bns,
  registry,
  ASCII_ENCODING,
  bob,
  bytesToHex,
  Tx,
  types,
  signatureVrsToRsv,
  charlie,
  assert,
  hashFqn,
} from './helpers.ts';
import { nameRegistrar } from './clarigen.ts';
import { btcBytes } from './mocks.ts';

const contract = nameRegistrar;

describe('name registrar', () => {
  const { chain } = deployWithNamespace();

  it('can register a name', () => {
    const nameObj = {
      name: asciiToBytes('alice'),
      namespace: btcBytes,
    };

    const price = chain.rovOk(bns.getNamePrice(nameObj));
    const salt = '00';
    const hashedFqn = hashFqn('alice', 'btc', salt);
    const result = chain.txOk(
      contract.nameRegister({
        ...nameObj,
        amount: price,
        salt: hexToBytes(salt),
        hashedFqn,
      }),
      alice
    );

    const nameInfo = chain.rovOk(bns.resolvePrincipal(alice));
    assertEquals(nameInfo, nameObj);
  });
});
