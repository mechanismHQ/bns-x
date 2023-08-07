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
  bob,
  bytesToHex,
  Tx,
  charlie,
  utilsRegisterBtc,
} from './helpers.ts';
import { btcBytes, signedContracts } from './mocks.ts';
import { nameWrapperCode } from './mocks/wrapper.ts';
import { registerNameV1, wrapperFactory } from './bns-helpers.ts';
import { signWithKey } from '../deno/signatures.ts';
import { accounts } from './clarigen-types.ts';
import { randomBytes } from '../vendor/noble-hashes/utils.ts';
import { beforeAll, beforeEach } from 'https://deno.land/std@0.159.0/testing/bdd.ts';

const deployerPK = hexToBytes('753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a6');
const alicePK = hexToBytes('7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c178');

const contract = contracts.l1BridgeV1;
const registry = contracts.l1Registry;
const bnsx = contracts.bnsxRegistry;

const namespace = btcBytes;

describe('l1-bridge-v1', () => {
  const { chain } = deployWithNamespace();

  function hashWrapData(name: Uint8Array, namespace: Uint8Array, inscriptionId: Uint8Array) {
    return chain.rov(
      contract.hashWrapData({
        name,
        namespace,
        inscriptionId,
      })
    );
  }

  function signWrap(
    name: Uint8Array,
    namespace: Uint8Array,
    // header: Uint8Array,
    inscriptionId: Uint8Array,
    signer: Uint8Array = deployerPK
  ) {
    const hash = hashWrapData(name, namespace, inscriptionId);
    const signature = signWithKey(hash, signer);
    return signature;
  }

  describe('successful wrap', () => {
    let height: bigint;
    const name = asciiToBytes('alice');
    let nameId: bigint;
    let header: Uint8Array;
    let hash: Uint8Array;
    const inscriptionId = randomBytes(33);
    let wrapEvents: unknown[];

    beforeAll(() => {
      const nameRes = utilsRegisterBtc({
        name: 'alice',
        owner: alice,
        chain,
      });
      nameId = nameRes.value;
      height = BigInt(chain.blockHeight - 1);

      hash = chain.rov(contract.hashForHeight(height));
    });

    it('calls `wrap` method', () => {
      const signature = signWrap(name, btcBytes, inscriptionId);
      const receipt = chain.txOk(
        contract.wrap({
          name,
          namespace,
          inscriptionId,
          height,
          signature,
        }),
        alice
      );
      wrapEvents = receipt.events;
      // console.log(receipt.events);
    });

    it('nft has been transfered to registry', () => {
      const tokenId = `${bnsx.identifier}::${bnsx.non_fungible_tokens[0].name}`;
      wrapEvents.expectNonFungibleTokenTransferEvent(
        `u${nameId}`,
        alice,
        registry.identifier,
        bnsx.identifier,
        bnsx.non_fungible_tokens[0].name
      );

      const owner = chain.rov(bnsx.getNameOwner(nameId));
      assertEquals(owner, registry.identifier);
    });

    it('inscription ID saved in registry', () => {
      const id = chain.rov(registry.getInscriptionId(nameId));
      assertEquals(id, inscriptionId);
    });
  });

  describe('wrap validation', () => {
    const inscriptionId = randomBytes(33);
    let nameId: bigint;
    const name = asciiToBytes('badsigner');
    beforeAll(() => {
      const regRes = utilsRegisterBtc({
        name: 'badsigner',
        owner: alice,
        chain,
      });
      nameId = regRes.value;
    });

    it('fails if invalid signer', () => {
      const height = BigInt(chain.blockHeight - 1);
      const hash = chain.rov(contract.hashForHeight(height));

      const signature = signWrap(name, namespace, inscriptionId, alicePK);
      const receipt = chain.txErr(
        contract.wrap({
          name,
          namespace,
          inscriptionId,
          height,
          // headerHash: hash,
          signature,
        }),
        alice
      );

      assertEquals(receipt.value, contract.constants.ERR_INVALID_SIGNER.value);
    });

    // it('fails if invalid header hash at height', () => {
    //   const height = BigInt(chain.blockHeight - 1);
    //   // different height:
    //   const hash = chain.rov(contract.hashForHeight(height - 1n));
    //   const signature = signWrap(name, namespace, inscriptionId, alicePK);
    //   const receipt = chain.txErr(
    //     contract.wrap({
    //       name,
    //       namespace,
    //       inscriptionId,
    //       height,
    //       // headerHash: hash,
    //       signature,
    //     }),
    //     alice
    //   );

    //   assertEquals(receipt.value, contract.constants.ERR_INVALID_BLOCK.value);
    // });

    it('fails if sending other name than owned', () => {
      const height = BigInt(chain.blockHeight - 1);
      const hash = chain.rov(contract.hashForHeight(height));

      const signature = signWrap(name, namespace, inscriptionId);
      const receipt = chain.txErr(
        contract.wrap({
          name,
          namespace,
          inscriptionId,
          height,
          // headerHash: hash,
          signature,
        }),
        bob
      );
      assertEquals(receipt.value, registry.constants.ERR_TRANSFER.value);
    });
  });
});
