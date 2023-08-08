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
  bob,
  bytesToHex,
  Tx,
  charlie,
} from './helpers.ts';
import { btcBytes, signedContracts } from './mocks.ts';
import { nameWrapperCode } from './mocks/wrapper.ts';
import { registerNameV1, wrapperFactory } from './bns-helpers.ts';
import { signWithKey } from '../deno/signatures.ts';
import { accounts } from './clarigen-types.ts';

const alicePK = hexToBytes('7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c178');
const bobPK = hexToBytes('530d9f61984c888536871c6573073bdfc0058896dc1adfe9a6a10dfacadc2091');

describe('wrapper-migrator', () => {
  const { chain } = deployWithNamespace();
  const migrator = contracts.wrapperMigratorV2;

  function signWrapper(wrapper: string, sender: string, signer: Uint8Array) {
    const hash = chain.rov(migrator.hashMigrationData(wrapper, sender));
    const signature = signWithKey(hash, signer);
    return signature;
  }

  function signWrapperForBob(wrapper: string, signer: Uint8Array) {
    return signWrapper(wrapper, bob, signer);
  }

  it('fails if signer not added', () => {
    const [contract] = signedContracts;

    assertEquals(chain.rov(migrator.isValidSigner(alice)), false);

    const error = chain.rovErr(
      migrator.verifyWrapper({
        signature: signWrapperForBob(contract.id, alicePK),
        sender: bob,
        wrapper: contract.id,
      })
    );
    assertEquals(error, 6001n);
  });

  it('is added as extension', () => {
    const id = migrator.identifier;
    const isExt = chain.rov(contracts.bnsxExtensions.isExtension(id));
    assertEquals(isExt, true);
  });

  it('hashes are the same', () => {
    const [contract] = signedContracts;
    const hash = chain.rov(migrator.hashPrincipal(contract.id));
    assertEquals(bytesToHex(hash), contract.hash);
  });

  it('trying to ensure hash-bytes are the same', () => {
    const addr = chain.rovOk(
      migrator.construct(hexToBytes('7321b74e2b6a7e949e6c4ad313035b1665095017'))
    );
    assertEquals(addr, alice);
  });

  it('adds alice as signer', () => {
    chain.txOk(
      migrator.setSigners([
        {
          signer: alice,
          enabled: true,
        },
      ]),
      deployer
    );

    assertEquals(chain.rov(migrator.isValidSigner(alice)), true);
  });

  it('now is a valid signature', () => {
    const [contract] = signedContracts;

    const res = chain.rovOk(
      migrator.verifyWrapper({
        // signature: signWrapperForBob(contract.id, alicePK),
        signature: signWrapper(contract.id, bob, alicePK),
        sender: bob,
        wrapper: contract.id,
      })
    );
    assertEquals(res, true);
  });

  it('testing different recipients', () => {
    const contractId = contracts.nameWrapperV2.identifier;
    Object.entries(accounts).forEach(([key, account]) => {
      const sender = account.address;
      const signature = signWrapper(contractId, sender, alicePK);
      const res = chain.rov(
        migrator.verifyWrapper({
          wrapper: contractId,
          sender,
          signature,
        })
      );
      assertEquals(res.isOk, true);
    });
  });

  it('signatures are valid for other recipients', () => {
    const [contract] = signedContracts;
    const res = chain.rovOk(
      migrator.verifyWrapper({
        signature: signWrapper(contract.id, alice, alicePK),
        sender: alice,
        wrapper: contract.id,
      })
    );
    assertEquals(res, true);
  });

  it('fails if sender is different than from signature', () => {
    const [contract] = signedContracts;
    const signature = signWrapper(contract.id, alice, alicePK);
    const error = chain.rovErr(
      migrator.verifyWrapper({
        signature,
        wrapper: contract.id,
        sender: bob,
      })
    );
    assertEquals(error, 6001n);
  });

  it('fails if other signer', () => {
    const [contract] = signedContracts;
    const signature = signWrapper(contract.id, alice, bobPK);
    const error = chain.rovErr(
      migrator.verifyWrapper({ signature, wrapper: contract.id, sender: alice })
    );
    assertEquals(error, 6001n);
  });

  describe('successful migration', () => {
    const [contract] = signedContracts;
    const nameObj = {
      name: asciiToBytes('alice'),
      namespace: btcBytes,
    };

    it('deploys the contract first', () => {
      const tx = Tx.deployContract(contract.id.split('.')[1], nameWrapperCode, deployer);
      (tx.deployContract as any).clarityVersion = 2;
      chain.chain.mineBlock([tx]);
    });

    it('alice owns alice.btc', () => {
      registerNameV1({
        chain,
        owner: alice,
        name: 'alice',
      });
    });

    it('migrates', () => {
      const signature = signWrapper(contract.id, alice, alicePK);
      chain.txOk(
        migrator.migrate({
          recipient: alice,
          wrapper: contract.id,
          signature: signature,
        }),
        alice
      );
    });

    it('v1 name now owned by wrapper', () => {
      const props = chain.rovOk(bns.nameResolve(nameObj));
      const wrapper = wrapperFactory(contract.id);
      const v1Name = chain.rovOk(bns.resolvePrincipal(contract.id));
      assertEquals(v1Name, nameObj);
      assertEquals(props.owner, contract.id);
      const name = chain.rovOk(wrapper.getOwnName());
      assertEquals(name, nameObj);
    });

    it('v2 name owned by alice', () => {
      const props = chain.rov(registry.getNameProperties(nameObj))!;
      assertEquals(props.owner, alice);
    });

    it('saves wrapper info state', () => {
      const contractId = signedContracts[0].id;
      const nameId = chain.rov(migrator.getWrapperName(contractId))!;
      const name = chain.rov(registry.getNamePropertiesById(nameId));
      assertEquals(name?.name, nameObj.name);
      assertEquals(name?.namespace, nameObj.namespace);
      assertEquals(chain.rov(migrator.getNameWrapper(nameId)), contractId);
    });
  });

  it('cannot re-use a wrapper if it already has a name', () => {
    registerNameV1({
      chain,
      owner: alice,
      name: 'alice2',
    });

    const wrapper = signedContracts[0];
    const signature = signWrapper(wrapper.id, alice, alicePK);

    const receipt = chain.txErr(
      migrator.migrate({
        recipient: alice,
        wrapper: wrapper.id,
        signature: signature,
      }),
      alice
    );

    assertEquals(receipt.value, 6004n);

    chain.txOk(
      bns.nameRevoke({
        name: asciiToBytes('alice2'),
        namespace: btcBytes,
      }),
      alice
    );
  });

  it('cannot re-use a wrapper if its already been used as a wrapper', () => {
    const signed = signedContracts[0];
    const wrapper = wrapperFactory(signed.id);
    chain.txOk(wrapper.unwrap(null), alice);

    registerNameV1({
      chain,
      owner: bob,
      name: 'bob',
    });

    const signature = signWrapper(signed.id, bob, alicePK);

    const receipt = chain.txErr(
      migrator.migrate({
        recipient: bob,
        wrapper: signed.id,
        signature: signature,
      }),
      bob
    );

    assertEquals(receipt.value, 6005n);
  });

  it('cannot migrate if you dont own a v1 name', () => {
    const signed = signedContracts[1];
    const signature = signWrapper(signed.id, charlie, alicePK);
    const receipt = chain.txErr(
      migrator.migrate({
        recipient: bob,
        wrapper: signed.id,
        signature: signature,
      }),
      charlie
    );

    assertEquals(receipt.value, 6000n);
  });
});
