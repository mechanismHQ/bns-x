import { registerNameV1 } from "./bns-helpers.ts";
import { testUtils } from "./clarigen.ts";
import {
  describe,
  it,
  registry,
  alice,
  charlie,
  deployer,
  deployWithNamespace,
  asciiToBytes,
  assertEquals,
  bob,
  contracts,
  bns,
  nftAsset,
  assert,
} from "./helpers.ts";
import { btcBytes } from "./mocks.ts";

const contract = contracts.nameWrapper;

const noNameErr = contract.constants.ERR_NO_NAME.value;
const notWrappedErr = contract.constants.ERR_NOT_WRAPPED.value;
const unauthorizedErr = contract.constants.ERR_UNAUTHORIZED.value;

describe("name-wrapper", () => {
  const { chain } = deployWithNamespace();

  describe("deployed with no v1 name", () => {
    it("has no legacy name", () => {
      const name = chain.rovErr(contract.getOwnName());
      assertEquals(name, noNameErr);

      assertEquals(chain.rovErr(contract.getNameInfo()), noNameErr);
    });

    it("has no owner", () => {
      assertEquals(chain.rovErr(contract.getOwner()), noNameErr);
    });
  });

  const nameObj = {
    name: asciiToBytes("wrapper"),
    namespace: btcBytes,
  };

  it("gets the v1 name wrapper.btc", () => {
    registerNameV1({
      chain,
      owner: alice,
      name: "wrapper",
    });

    chain.txOk(
      bns.nameTransfer({
        ...nameObj,
        newOwner: contract.identifier,
        zonefileHash: null,
      }),
      alice
    );
  });

  it("now knows its v1 name", () => {
    const name = chain.rovOk(contract.getOwnName());
    assertEquals(name, nameObj);
  });

  it("before it is wrapped, has no owner", () => {
    assertEquals(chain.rovErr(contract.getOwner()), notWrappedErr);
    assertEquals(chain.rovErr(contract.getNameInfo()), notWrappedErr);
  });

  describe("after being wrapped", () => {
    let nameId: bigint;
    it("has v2 name", () => {
      const { value: id } = chain.txOk(
        testUtils.nameRegister({
          ...nameObj,
          owner: alice,
        }),
        deployer
      );
      nameId = id;

      const info = chain.rovOk(contract.getNameInfo());
      assertEquals(info.id, id);
      assertEquals(info.name, nameObj.name);
      assertEquals(info.namespace, btcBytes);
      assertEquals(info.owner, alice);
    });

    it("owner is set from v2", () => {
      const owner = chain.rovOk(contract.getOwner());
      assertEquals(owner, alice);
    });

    it("owner is changed if name is moved", () => {
      chain.txOk(
        registry.transfer({
          sender: alice,
          id: 0n,
          recipient: bob,
        }),
        alice
      );

      assertEquals(chain.rovOk(contract.getOwner()), bob);
    });

    it("only owner can make name-update", () => {
      const res = chain.txErr(
        contract.nameUpdate(new Uint8Array([0, 1, 2])),
        alice
      );
      assertEquals(res.value, unauthorizedErr);
    });

    it("owner can name-update", () => {
      const res = chain.txOk(
        contract.nameUpdate(new Uint8Array([0, 1, 2])),
        bob
      );

      const [event] = res.events;
      assertEquals(res.events.length, 1);
      assertEquals(event.contract_event.contract_identifier, bns.identifier);

      assert(event.contract_event.value.includes('op: "name-update"'));
    });

    it("cant be unwrapped by non-owner", () => {
      const receipt = chain.txErr(contract.unwrap(null), alice);
      assertEquals(receipt.value, unauthorizedErr);
    });

    it("can be unwrapped by owner and sent to other address", () => {
      const receipt = chain.txOk(contract.unwrap(alice), bob);

      assertEquals(chain.rovErr(contract.getOwnName()), noNameErr);

      const bnsInfo = chain.rovOk(bns.nameResolve(nameObj));
      assertEquals(bnsInfo.owner, alice);

      receipt.events.expectNonFungibleTokenBurnEvent(
        `u${nameId}`,
        bob,
        registry.identifier,
        nftAsset
      );
    });
  });

  it("defaults to unwrapping to v2 owner", () => {
    registerNameV1({
      chain,
      owner: bob,
      name: "wrap2",
    });

    const nameObj = {
      namespace: btcBytes,
      name: asciiToBytes("wrap2"),
    };

    chain.txOk(
      bns.nameTransfer({
        ...nameObj,
        zonefileHash: null,
        newOwner: contract.identifier,
      }),
      bob
    );

    chain.txOk(
      testUtils.nameRegister({
        ...nameObj,
        owner: bob,
      }),
      deployer
    );

    chain.txOk(contract.unwrap(null), bob);

    const bnsInfo = chain.rovOk(bns.nameResolve(nameObj));

    assertEquals(bnsInfo.owner, bob);
  });
});
