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
import { btc, P } from '../deps.ts';
import { sha256 } from '../vendor/noble-hashes/sha256.ts';

const deployerPK = hexToBytes('753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a6');
const alicePK = hexToBytes('7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c178');

const contract = contracts.l1BridgeV1;
const registry = contracts.l1Registry;
const bnsx = contracts.bnsxRegistry;
const migrator = contracts.wrapperMigratorV2;

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

  function hashUnwrapData(inscriptionId: Uint8Array, owner: Uint8Array) {
    return chain.rov(
      contract.hashUnwrapData({
        inscriptionId,
        owner,
      })
    );
  }

  function signUnwrap(
    inscriptionId: Uint8Array,
    owner: Uint8Array,
    signer: Uint8Array = deployerPK
  ) {
    const hash = hashUnwrapData(inscriptionId, owner);
    const signature = signWithKey(hash, signer);
    return signature;
  }

  const aliceInscriptionId = randomBytes(33);

  describe('successful wrap', () => {
    let height: bigint;
    const name = asciiToBytes('alice');
    let nameId: bigint;
    let header: Uint8Array;
    let hash: Uint8Array;
    const inscriptionId = aliceInscriptionId;
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
        contract.bridgeToL1({
          name,
          namespace,
          inscriptionId,
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
        contract.bridgeToL1({
          name,
          namespace,
          inscriptionId,
          // height,
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
    //     contract.bridgeToL1({
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
        contract.bridgeToL1({
          name,
          namespace,
          inscriptionId,
          // height,
          // headerHash: hash,
          signature,
        }),
        bob
      );
      assertEquals(receipt.value, contract.constants.ERR_TRANSFER.value);
    });
  });

  describe('migrate-and-bridge', () => {
    const name = asciiToBytes('bob');
    const inscriptionId = randomBytes(33);
    let bridgeEvents: unknown[];
    const wrapperId = `${deployer}.name-wrapper-xx`;
    let nameId: bigint;

    beforeAll(() => {
      registerNameV1({
        chain,
        owner: bob,
        name: 'bob',
      });
    });

    it('calls `migrate-and-wrap` successfully', () => {
      const migrateData = chain.rov(
        migrator.hashMigrationData({
          sender: bob,
          wrapper: wrapperId,
        })
      );
      const migrateSignature = signWithKey(migrateData, deployerPK);
      const bridgeSignature = signWrap(name, btcBytes, inscriptionId);

      const receipt = chain.txOk(
        contract.migrateAndBridge({
          name,
          namespace: btcBytes,
          inscriptionId,
          bridgeSignature,
          wrapper: wrapperId,
          migrateSignature,
        }),
        bob
      );
      bridgeEvents = receipt.events;
    });

    it('moved bob.btc to bnsx', () => {
      const id = chain.rov(
        bnsx.getIdForName({
          name,
          namespace: btcBytes,
        })
      )!;
      nameId = id;
      bridgeEvents.expectNonFungibleTokenMintEvent(
        `u${id}`,
        registry.identifier,
        bnsx.identifier,
        bnsx.non_fungible_tokens[0].name
      );
    });
  });

  describe('bridging back to l2', () => {
    it('can generate a burn script and output', () => {
      const burnScript = chain.rov(contract.generateBurnScript(alice));

      const decodedScript = btc.Script.decode(burnScript);
      const hashData = chain.rov(contract.hashBurnScriptData(alice));
      assertEquals(P.equalBytes(hashData, decodedScript[0] as Uint8Array), true);
      assertEquals(decodedScript[1], 'DROP');
      assertEquals(decodedScript[2], 0);

      const burnOutput = chain.rov(contract.generateBurnOutput(alice));
      const parsedOutput = btc.OutScript.decode(burnOutput);
      assertEquals(parsedOutput.type, 'wsh');
      if (parsedOutput.type !== 'wsh') throw new Error('Invalid output');

      const expectedHash = sha256(burnScript);
      assertEquals(P.equalBytes(expectedHash, parsedOutput.hash), true);
    });

    it('can validate unwrap signatures', () => {
      const burnScript = chain.rov(contract.generateBurnOutput(alice));
      const signature = signUnwrap(aliceInscriptionId, burnScript);

      const isValid = chain.rovOk(
        contract.validateUnwrapSignature({
          recipient: alice,
          owner: burnScript,
          inscriptionId: aliceInscriptionId,
          signature,
        })
      );

      assertEquals(isValid, true);
    });

    it('invalidates unwrap sig with wrong signer', () => {
      const burnScript = chain.rov(contract.generateBurnOutput(alice));
      // different signer:
      const signature = signUnwrap(aliceInscriptionId, burnScript, alicePK);

      const err = chain.rovErr(
        contract.validateUnwrapSignature({
          recipient: alice,
          owner: burnScript,
          inscriptionId: aliceInscriptionId,
          signature,
        })
      );

      assertEquals(err, contract.constants.ERR_INVALID_SIGNER.value);
    });

    it('invalidates unwrap sig with wrong owner', () => {
      // different address:
      const burnScript = chain.rov(contract.generateBurnOutput(deployer));
      const signature = signUnwrap(aliceInscriptionId, burnScript);

      const err = chain.rovErr(
        contract.validateUnwrapSignature({
          recipient: alice,
          owner: burnScript,
          inscriptionId: aliceInscriptionId,
          signature,
        })
      );

      assertEquals(err, contract.constants.ERR_INVALID_BURN_ADDRESS.value);
    });
  });
});
