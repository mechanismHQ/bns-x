import {
  beforeAll,
  deployWithNamespace,
  describe,
  it,
  assertEquals,
  asciiToBytes,
  hashSalt,
  ASCII_ENCODING,
  nftAsset,
  alice,
  bob,
  charlie,
  utilsRegisterBtc,
  deployer,
  utils,
  registry,
} from "./helpers.ts";
import { btcBytes } from "./mocks.ts";

describe("name registry", () => {
  const { chain, contracts, accounts } = deployWithNamespace();
  const contract = contracts.nameRegistry;

  function registerName(name: string, owner: string) {
    const receipt = utilsRegisterBtc({ name, owner, chain });
    return receipt.value;
  }

  function getNames(account: string) {
    const first = chain.rov(contract.getPrimaryNameProperties(account));
    if (first === null) return [];
    return traverse([first.id]);
  }

  function traverse(nodes: bigint[]): bigint[] {
    const node = nodes[nodes.length - 1];
    const next = chain.rov(contract.getNextNodeId(node));
    if (next === null) return nodes;
    return traverse([...nodes, next]);
  }

  it("last id initially is 0", () => {
    assertEquals(chain.rovOk(contract.getLastTokenId()), 0n);
  });

  describe("transfers", () => {
    let aliceId: bigint;
    const aliceName = {
      name: asciiToBytes("alice"),
      namespace: btcBytes,
      // encoding: ASCII_ENCODING,
    };
    it("alice transfers to bob", () => {
      const id = registerName("alice", alice);
      aliceId = id;

      assertEquals(chain.rov(contract.getBalance(alice)), 1n);
      assertEquals(chain.rov(contract.getBalance(bob)), 0n);
      assertEquals(chain.rov(contract.getNextNodeId(id)), null);
      const receipt = chain.txOk(
        contract.transfer({
          id,
          sender: alice,
          recipient: bob,
        }),
        alice
      );
      assertEquals(chain.rov(contract.getBalance(alice)), 0n);
      assertEquals(chain.rov(contract.getBalance(bob)), 1n);
      assertEquals(chain.rovOk(contract.getBalanceOf(alice)), 0n);

      assertEquals(chain.rovOk(contract.getLastTokenId()), aliceId);

      assertEquals(chain.rovOk(contract.getOwner(aliceId)), bob);
    });

    it("alice doesnt have a primary name anymore", () => {
      assertEquals(chain.rov(contract.getPrimaryName(alice)), null);
    });

    it("name is registered to bob now", () => {
      assertEquals(chain.rovOk(contract.getOwner(aliceId)), bob);

      const props = chain.rov(contract.getNameProperties(aliceName));
      assertEquals(props?.owner, bob);
      assertEquals(props?.id, aliceId);
    });

    it("set as bobs primary name", () => {
      assertEquals(chain.rov(contract.getPrimaryName(bob)), aliceName);

      const props = chain.rov(contract.getNamePropertiesById(aliceId));
      assertEquals(chain.rov(contract.getPrimaryNameProperties(bob)), props);
    });
  });

  it("bob adds second name", () => {
    const id = registerName("bob", bob);
    assertEquals(id, 1n);
    assertEquals(chain.rovOk(registry.getLastTokenId()), 1n);
  });

  it("bob transfers primary name", () => {
    chain.txOk(
      contract.transfer({
        id: 0n,
        sender: bob,
        recipient: charlie,
      }),
      bob
    );
  });

  it("can lookup ID by name", () => {
    const id = 1n;
    const { name, namespace } = chain.rov(contract.getNamePropertiesById(id))!;
    assertEquals(chain.rov(contract.getIdForName({ name, namespace })), id);
  });

  it("bobs primary name is set to his second name", () => {
    const primary = chain.rov(contract.getPrimaryName(bob));
    assertEquals(primary?.name, asciiToBytes("bob"));
  });

  describe("updating primary name", () => {
    it("charlie registers a second name", () => {
      assertEquals(registerName("charlie", charlie), 2n);
    });

    it("cannot set primary if you dont own it", () => {
      const receipt = chain.txErr(contract.setPrimaryName(0n), bob);
      assertEquals(receipt.value, 4000n);
      assertEquals(
        chain.txErr(contract.setPrimaryName(0n), alice).value,
        4000n
      );
    });

    it("cannot set primary to the same as current primary", () => {
      const receipt = chain.txErr(contract.setPrimaryName(0n), charlie);
      assertEquals(receipt.value, 4002n);
    });

    it("charlie updates primary name", () => {
      const receipt = chain.txOk(contract.setPrimaryName(2n), charlie);

      const primary = chain.rov(contract.getPrimaryName(charlie));
      assertEquals(primary?.name, asciiToBytes("charlie"));
    });

    it('works if you update a "middle" fallback', () => {
      const { value: newId } = utilsRegisterBtc({
        name: "fallback2",
        owner: charlie,
        chain,
      });

      chain.txOk(contract.setPrimaryName(0n), charlie);

      assertEquals(
        chain.rov(contract.getPrimaryNameProperties(charlie))?.id,
        0n
      );

      assertEquals(getNames(charlie), [0n, 2n, newId]);
    });
  });

  describe("helpers", () => {
    it("errors when id not found", () => {
      const fakeId = 1234567n;
      const invalidIdErr = 4003n;

      assertEquals(
        chain.txErr(contract.setPrimaryName(fakeId), alice).value,
        invalidIdErr
      );

      assertEquals(chain.rov(contract.getNamePropertiesById(fakeId)), null);
    });

    it("none returned for invalid name", () => {
      assertEquals(
        chain.rov(
          contract.getNameProperties({
            name: asciiToBytes("asdfsdf"),
            namespace: btcBytes,
          })
        ),
        null
      );
    });

    it("none for primary name when account has none", () => {
      const primary = chain.rov(contract.getPrimaryNameProperties(deployer));
      assertEquals(primary, null);
      assertEquals(chain.rov(contract.getPrimaryName(deployer)), null);
    });
  });

  describe("burns", () => {
    let id: bigint;
    let balanceBefore: bigint;
    let namesBefore: bigint[];
    it("set up alice with a name", () => {
      balanceBefore = chain.rov(contract.getBalance(alice));
      namesBefore = getNames(alice);
      const { value } = utilsRegisterBtc({
        name: "toburn",
        owner: alice,
        chain,
      });
      id = value;
    });

    it("can only burn by owner", () => {
      const receipt = chain.txErr(registry.burn(id), bob);
      assertEquals(receipt.value, contract.constants.ERR_NOT_OWNER.value);
    });

    it("can be burnt by owner", () => {
      const receipt = chain.txOk(registry.burn(id), alice);
      receipt.events.expectNonFungibleTokenBurnEvent(
        `u${id}`,
        alice,
        registry.identifier,
        nftAsset
      );
      receipt.events.expectPrintEvent(
        registry.identifier,
        `{id: u${id}, topic: "burn"}`
      );
    });

    it("updates state appropriately", () => {
      assertEquals(getNames(alice), namesBefore);
      assertEquals(chain.rov(contract.getBalance(alice)), balanceBefore);
    });
  });
});
