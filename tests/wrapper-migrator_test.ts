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
} from "./helpers.ts";
import { btcBytes, signedContracts } from "./mocks.ts";
import { nameWrapperCode } from "./mocks/wrapper.ts";
import { registerNameV1, wrapperFactory } from "./bns-helpers.ts";

const alicePK =
  "7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c178";

describe("wrapper-migrator", () => {
  const { chain } = deployWithNamespace();
  const migrator = contracts.wrapperMigrator;

  it("fails if signer not added", () => {
    const [contract] = signedContracts;

    const error = chain.rovErr(
      migrator.verifyWrapper({
        signature: signatureVrsToRsv(contract.signature),
        wrapper: contract.id,
      })
    );
    assertEquals(error, 6001n);
  });

  it("hashes are the same", () => {
    const [contract] = signedContracts;
    const hash = chain.rov(migrator.hashPrincipal(contract.id));
    assertEquals(bytesToHex(hash), contract.hash);
  });

  it("trying to ensure hash-bytes are the same", () => {
    const addr = chain.rovOk(
      migrator.construct(hexToBytes("7321b74e2b6a7e949e6c4ad313035b1665095017"))
    );
    assertEquals(addr, alice);
  });

  it("adds alice as signer", () => {
    chain.txOk(
      migrator.setSigners([
        {
          signer: alice,
          enabled: true,
        },
      ]),
      deployer
    );
  });

  it("now is a valid signature", () => {
    const [contract] = signedContracts;

    const res = chain.rovOk(
      migrator.verifyWrapper({
        signature: signatureVrsToRsv(contract.signature),
        wrapper: contract.id,
      })
    );
    assertEquals(res, true);
  });

  describe("successful migration", () => {
    const [contract] = signedContracts;
    const nameObj = {
      name: asciiToBytes("alice"),
      namespace: btcBytes,
    };

    it("deploys the contract first", () => {
      const tx = Tx.deployContract(
        contract.id.split(".")[1],
        nameWrapperCode,
        deployer
      );
      (tx.deployContract as any).clarityVersion = 2;
      chain.chain.mineBlock([tx]);
    });

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
          wrapper: contract.id,
          signature: signatureVrsToRsv(contract.signature),
        }),
        alice
      );
    });

    it("v1 name now owned by wrapper", () => {
      const props = chain.rovOk(bns.nameResolve(nameObj));
      const wrapper = wrapperFactory(contract.id);
      const v1Name = chain.rovOk(bns.resolvePrincipal(contract.id));
      assertEquals(v1Name, nameObj);
      assertEquals(props.owner, contract.id);
      const name = chain.rovOk(wrapper.getOwnName());
      assertEquals(name, nameObj);
    });

    it("v2 name owned by alice", () => {
      const props = chain.rov(registry.getNameProperties(nameObj))!;
      assertEquals(props.owner, alice);
    });

    it("saves wrapper info state", () => {
      const contractId = signedContracts[0].id;
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

    const wrapper = signedContracts[0];

    const receipt = chain.txErr(
      migrator.migrate({
        recipient: alice,
        wrapper: wrapper.id,
        signature: signatureVrsToRsv(wrapper.signature),
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
    const signed = signedContracts[0];
    const wrapper = wrapperFactory(signed.id);
    chain.txOk(wrapper.unwrap(null), alice);

    registerNameV1({
      chain,
      owner: bob,
      name: "bob",
    });

    const receipt = chain.txErr(
      migrator.migrate({
        recipient: bob,
        wrapper: signed.id,
        signature: signatureVrsToRsv(signed.signature),
      }),
      bob
    );

    assertEquals(receipt.value, 6005n);
  });

  it("cannot migrate if you dont own a v1 name", () => {
    const signed = signedContracts[1];
    const receipt = chain.txErr(
      migrator.migrate({
        recipient: bob,
        wrapper: signed.id,
        signature: signatureVrsToRsv(signed.signature),
      }),
      charlie
    );

    assertEquals(receipt.value, 6000n);
  });

  it("verifying api-created signatures", () => {
    const wrapperId =
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG.name-wrapper-621";
    const signature =
      "07ccc5dffa36224f2670a33150d031aa665e2056262d1b1dcf77dc034f54a549228aa3ed83fb3bc217e47a9c6da6938967aaf3d9193c24c974556af2e66e189501";

    // registerNameV1({
    //   chain,
    //   owner: alice,
    //   name: "test3",
    // });

    chain.txOk(
      migrator.migrate({
        recipient: bob,
        wrapper: wrapperId,
        signature: hexToBytes(signature),
      }),
      bob
    );

    const isValid = chain.rovOk(
      migrator.verifyWrapper(wrapperId, hexToBytes(signature))
    );
    assertEquals(isValid, true);

    const hash = chain.rov(migrator.hashPrincipal(wrapperId));

    console.log("hash", bytesToHex(hash));

    const debugged = chain.rovOk(
      migrator.debugSignature({
        wrapper: wrapperId,
        signature: hexToBytes(signature),
      })
    );
  });
});
