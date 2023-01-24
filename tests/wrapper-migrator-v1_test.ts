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
} from "./helpers.ts";
import { btcBytes, signedWrapperIds, alicePubkeyHash } from "./mocks.ts";
import { nameWrapperCode } from "./mocks/wrapper.ts";
import { registerNameV1, wrapperFactory } from "./bns-helpers.ts";

const migrator = contracts.wrapperMigrator;

function getWrapper(id: number) {
  const addr = `${deployer}.wrapper-${id}`;
  const obj = signedWrapperIds[id];
  return {
    ...obj,
    signature: signatureVrsToRsv(obj.signature),
    addr,
  };
}

describe("wrapper-migrator-v1", () => {
  const { chain } = deployWithNamespace();
  // const
  const alicePub = alicePubkeyHash;

  it("hashing ids works as expected", () => {
    const w = getWrapper(0);
    const clarityHash = chain.rov(migrator.hashId(0n));
    assertEquals(bytesToHex(clarityHash), w.hash);
  });

  it("deployed name wrapper", () => {
    const w = getWrapper(1);
    const tx = Tx.deployContract(
      w.addr.split(".")[1],
      nameWrapperCode,
      deployer
    );
    const block = chain.chain.mineBlock([tx]);
    assertEquals(block.receipts[0].result, "u1");
  });

  describe("before alice added as signer", () => {
    it("alice is not a valid signer at first", () => {
      const valid = chain.rov(migrator.isValidSigner(alicePub));
      assertEquals(valid, false);
    });

    // it("registering first wrapper", () => {
    //   const wrapper = getWrapper(0);
    //   // const receipt = chain.txOk(migrator.registerWrapper(wrapper.addr), alice);
    //   assertEquals(receipt.value, 0n);
    // });

    it("verifying wrapper throws error", () => {
      const wrapper = getWrapper(1);
      const result = chain.rovErr(
        migrator.verifyWrapper({
          wrapper: wrapper.addr,
          signature: wrapper.signature,
        })
      );
      assertEquals(result, migrator.constants.ERR_UNAUTHORIZED.value);
    });
  });

  it("alice added as a signer", () => {
    chain.txOk(
      migrator.setSigners([
        {
          signer: alicePub,
          enabled: true,
        },
      ]),
      deployer
    );

    assert(chain.rov(migrator.isValidSigner(alicePub)));
  });

  it("verifying wrapper signature", () => {
    const wrapper = getWrapper(1);
    const result = chain.rovOk(
      migrator.verifyWrapper({
        wrapper: wrapper.addr,
        signature: wrapper.signature,
      })
    );
    assertEquals(result, true);
  });

  it("migrator is set as extension", () => {
    const isExt = chain.rov(
      contracts.bnsxExtensions.hasRole(migrator.identifier, "registry")
    );
    assert(isExt);
  });

  describe("successful migration", () => {
    const w = getWrapper(1);

    const nameObj = {
      name: asciiToBytes("alice"),
      namespace: btcBytes,
    };

    it("alice owns alice.btc", () => {
      registerNameV1({
        chain,
        owner: alice,
        name: "alice",
      });
    });

    it("migrates", () => {
      const receipt = chain.txOk(
        migrator.migrate({
          recipient: alice,
          wrapper: w.addr,
          signature: w.signature,
        }),
        alice
      );
    });

    it("v1 name now owned by wrapper", () => {
      const props = chain.rovOk(bns.nameResolve(nameObj));
      const wrapper = wrapperFactory(w.addr);
      const v1Name = chain.rovOk(bns.resolvePrincipal(w.addr));
      assertEquals(v1Name, nameObj);
      assertEquals(props.owner, w.addr);
      const name = chain.rovOk(wrapper.getOwnName());
      assertEquals(name, nameObj);
    });

    it("v2 name owned by alice", () => {
      const props = chain.rov(registry.getNameProperties(nameObj))!;
      assertEquals(props.owner, alice);
    });

    it("saves wrapper info state", () => {
      const contractId = w.addr;
      const nameId = chain.rov(migrator.getWrapperName(contractId))!;
      const name = chain.rov(registry.getNamePropertiesById(nameId));
      assertEquals(name?.name, nameObj.name);
      assertEquals(name?.namespace, nameObj.namespace);
      assertEquals(chain.rov(migrator.getNameWrapper(nameId)), contractId);
    });
  });

  it("cannot re-use a wrapper if it already has a name", () => {
    registerNameV1({
      chain,
      owner: alice,
      name: "alice2",
    });

    const wrapper = getWrapper(1);

    const receipt = chain.txErr(
      migrator.migrate({
        recipient: alice,
        wrapper: wrapper.addr,
        signature: wrapper.signature,
      }),
      alice
    );

    assertEquals(receipt.value, 6004n);

    chain.txOk(
      bns.nameRevoke({
        name: asciiToBytes("alice2"),
        namespace: btcBytes,
      }),
      alice
    );
  });

  it("cannot re-use a wrapper if its already been used as a wrapper", () => {
    const signed = getWrapper(1);
    const wrapper = wrapperFactory(signed.addr);
    chain.txOk(wrapper.unwrap(null), alice);

    registerNameV1({
      chain,
      owner: bob,
      name: "bob",
    });

    const receipt = chain.txErr(
      migrator.migrate({
        recipient: bob,
        wrapper: signed.addr,
        signature: signed.signature,
      }),
      bob
    );

    assertEquals(receipt.value, 6005n);
  });

  it("cannot migrate if you dont own a v1 name", () => {
    const signed = getWrapper(2);
    chain.txOk(migrator.registerWrapper(signed.addr), alice);
    const receipt = chain.txErr(
      migrator.migrate({
        recipient: bob,
        wrapper: signed.addr,
        signature: signed.signature,
      }),
      charlie
    );

    assertEquals(receipt.value, 6000n);
  });
});
