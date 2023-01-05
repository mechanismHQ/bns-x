import { beforeAll } from "https://deno.land/std@0.159.0/testing/bdd.ts";
import { txErr, txOk } from "../../../clarigen/deno-clarigen/mod.ts";
import {
  randomName,
  allNamespacesRaw,
  registerNameV1,
  randomNamespace,
} from "./bns-helpers.ts";
import {
  asciiToBytes,
  assertEquals,
  bytesToAscii,
  deployWithNamespace,
  describe,
  it,
  assert,
  hashFqn,
  hexToBytes,
  hashSalt,
  assertExists,
  ASCII_ENCODING,
  nftAsset,
  deployer,
  btcBytes,
} from "./helpers.ts";

const salt = "0000";
const saltBuff = hexToBytes(salt);
const zonefile = hexToBytes("0000000000000000000000000000000000000000");

const btcSpendOpts = {
  stxPrice: 2000000n,
  burn: true,
};

function btcPreorderArgs(name: string) {
  return {
    fqn: hashFqn(name, "btc", salt),
    ...btcSpendOpts,
  };
}

declare global {
  interface Array<T> {
    expectSTXBurnEvent(amount: number | bigint, sender: string): any;
  }
}

Array.prototype.expectSTXBurnEvent = function (amount, sender) {
  for (const event of this) {
    try {
      const { stx_burn_event } = event;
      return {
        amount: stx_burn_event.amount.expectInt(amount),
        sender: stx_burn_event.sender.expectPrincipal(sender),
      };
    } catch (_error) {
      continue;
    }
  }
  throw new Error("Unable to retrieve expected STXBurnEvent");
};

describe("legacy namespaces registrar", () => {
  const { accounts, chain, contracts, bns } = deployWithNamespace();
  const contract = contracts.legacyNamespace;
  const registry = contracts.nameRegistry;
  const bnsTest = contracts.bnsV1;

  const [alice, bob, charlie, dave] = accounts.addresses(
    "wallet_1",
    "wallet_2",
    "wallet_3",
    "wallet_4"
  );

  it("alice registers alice.btc on v1", () => {
    registerNameV1({
      chain,
      name: "alice",
      owner: alice,
    });
  });

  describe("helpers", () => {
    it("can check legacy registered status", () => {
      assertEquals(
        chain.rov(contract.isLegacyRegistered(asciiToBytes("alice"))),
        true
      );
      assertEquals(
        chain.rov(contract.isLegacyRegistered(asciiToBytes("bob"))),
        false
      );
    });

    it("properly creates hashed-salted-fqn", () => {
      function assertFqn(name: string, salt: string) {
        assertEquals(
          chain.rov(
            contract.getHashedSaltedFqn(
              asciiToBytes(name),
              btcBytes,
              hexToBytes(salt)
            )
          ),
          hashFqn(name, "btc", salt)
        );
      }
      assertFqn("alice", "0000");
      assertFqn("abcsdfewsf", "deadbeef");
    });

    it("can validate characters", () => {
      const letters = "abcdefghijklmnopqrstuvwxyz".split("");
      const digits = "0123456789".split("");
      const special = "-_".split("");
      [...letters, ...digits, ...special].forEach((c) => {
        assert(chain.rov(contract.isCharValid(asciiToBytes(c))));
        chain.rov(bnsTest.isCharValid(asciiToBytes(c)));
      });

      const all = [...letters, ...digits, ...special].join("");

      assert(chain.rov(contract.hasValidChars(asciiToBytes(all))));
      chain.rov(bnsTest.hasInvalidChars(asciiToBytes(all)));

      // this "facebook" includes a non-ascii character
      assert(!chain.rov(contract.hasValidChars(asciiToBytes("faceboоk"))));

      function testCodes(start: number, end: number) {
        const codes: number[] = [];
        for (let i = start; i <= end; i++) {
          codes.push(i);
        }
        assert(!chain.rov(contract.hasValidChars(new Uint8Array(codes))));
      }
      testCodes(0, 44);
      testCodes(46, 93);
      testCodes(94, 94);
      testCodes(96, 96);
    });
  });

  describe("cannot register legacy name", () => {
    it("bob can preorder alice.btc", () => {
      const salt = "0000";
      const fqn = hashFqn("alice", "btc", salt);
      chain.txOk(contract.namePreorder(btcPreorderArgs("alice")), bob);

      const preorder = chain.rov(
        contract.getPreorder({
          fqn,
          buyer: bob,
        })
      );
      assertExists(preorder);
      assertEquals(preorder?.claimed, false);
    });

    it("bob cannot register alice.btc because its registered in v1", () => {
      const receipt = chain.txErr(
        contract.nameRegister({
          name: asciiToBytes("alice"),
          namespace: btcBytes,
          salt: saltBuff,
          zonefile,
        }),
        bob
      );
      assertEquals(receipt.value, 5003n);
    });
  });

  it("bob cannot register name without preorder", () => {
    const receipt = chain.txErr(
      contract.nameRegister({
        name: asciiToBytes("bob"),
        namespace: btcBytes,
        salt: saltBuff,
        zonefile,
      }),
      bob
    );
    assertEquals(receipt.value, 5002n);
  });

  it("cannot register name with invalid chars", () => {
    const name = "BOB";
    const nameBytes = asciiToBytes(name);

    chain.txOk(contract.namePreorder(btcPreorderArgs(name)), bob);

    const receipt = chain.txErr(
      contract.nameRegister({
        name: nameBytes,
        namespace: btcBytes,
        salt: saltBuff,
        zonefile,
      }),
      bob
    );

    assertEquals(receipt.value, 5004n);
  });

  describe("successful registration bob.btc", () => {
    const name = "bob";
    const nameBytes = asciiToBytes(name);
    let events: any[];
    const nameArg = {
      name: nameBytes,
      namespace: btcBytes,
      encoding: ASCII_ENCODING,
    };

    it("registers", () => {
      chain.txOk(contract.namePreorder(btcPreorderArgs(name)), bob);

      const receipt = chain.txOk(
        contract.nameRegister({
          name: nameBytes,
          namespace: btcBytes,
          salt: saltBuff,
          zonefile,
        }),
        bob
      );
      events = receipt.events;

      assertEquals(receipt.value, 0n);
    });

    it("mints an nft", () => {
      events.expectNonFungibleTokenMintEvent(
        "u0",
        bob,
        registry.identifier,
        nftAsset
      );
    });

    it("owns nft", () => {
      const id = chain.rov(registry.getIdForName(nameArg))!;
      assertEquals(id, 0n);

      const owner = chain.rovOk(registry.getOwner(0n));
      assertEquals(owner, bob);
    });

    it("is registered in the registry", () => {
      const props = chain.rov(registry.getNameProperties(nameArg));
      if (!props) throw new Error("Missing name props");
      assertEquals(props.owner, bob);
      assertEquals(props.zonefileHash, zonefile);
      assertEquals(props.registeredAt, BigInt(chain.blockHeight) - 1n);
    });

    it("is set as primary name", () => {
      const name = chain.rov(registry.getPrimaryName(bob));
      assertEquals(name, nameArg);
    });

    it("now is unavailable", () => {
      chain.txOk(contract.namePreorder(btcPreorderArgs(name)), charlie);
      const receipt = chain.txErr(
        contract.nameRegister({
          name: nameBytes,
          namespace: btcBytes,
          zonefile,
          salt: saltBuff,
        }),
        charlie
      );
      assertEquals(receipt.value, 4001n);
    });

    it('preorder is now "claimed"', () => {
      const preorder = chain.rov(
        contract.getPreorder({
          fqn: hashFqn(name, "btc", salt),
          buyer: bob,
        })
      );
      assertEquals(preorder?.claimed, true);
    });
  });

  it("properly validates price when registering a name", () => {
    function testRandomPrice() {
      const name = randomName();
      const nameBytes = asciiToBytes(name);
      const ns = allNamespacesRaw[2];
      const truePrice = chain.rovOk(
        contract.getNamePrice(nameBytes, ns.namespace)
      );

      const {
        receipts: [preorderRes, registerRes],
      } = chain.mineBlock(
        txOk(
          contract.namePreorder(
            hashFqn(name, bytesToAscii(ns.namespace), salt),
            truePrice - 1n,
            false
          ),
          bob
        ),
        txErr(
          contract.nameRegister(nameBytes, ns.namespace, saltBuff, zonefile),
          bob
        )
      );
      assertEquals(registerRes.value, 5010n);
      preorderRes.events.expectSTXTransferEvent(
        truePrice - 1n,
        bob,
        `${deployer}.executor-dao`
      );
    }

    const tests = 10;
    for (let i = 0; i < tests; i++) {
      testRandomPrice();
    }
  });

  it("burns stx when specified", () => {
    const name = randomName();
    const { events } = chain.txOk(
      contract.namePreorder(btcPreorderArgs(name)),
      deployer
    );
    events.expectSTXBurnEvent(2000000n, deployer);
  });

  describe("successful registration of random names", () => {
    function testRandomName() {
      const name = randomName();
      // test first 4 namespaces, others have too high a price
      const nsIndex = Math.floor(Math.random() * 4);
      const ns = allNamespacesRaw[nsIndex];
      const nameBytes = asciiToBytes(name);
      const nameArg = {
        name: nameBytes,
        namespace: ns.namespace,
        encoding: ASCII_ENCODING,
      };
      let events: any[];
      let price: bigint;
      let id: bigint;

      describe(`Testing ${name}.${bytesToAscii(ns.namespace)}`, () => {
        beforeAll(() => {
          price = chain.rovOk(contract.getNamePrice(nameBytes, ns.namespace));
        });
        it("registers", () => {
          chain.txOk(
            contract.namePreorder({
              fqn: hashFqn(name, bytesToAscii(ns.namespace), salt),
              stxPrice: price,
              burn: true,
            }),
            deployer
          );

          const receipt = chain.txOk(
            contract.nameRegister({
              name: nameBytes,
              namespace: ns.namespace,
              salt: saltBuff,
              zonefile,
            }),
            deployer
          );
          events = receipt.events;
          id = receipt.value;
        });

        it("mints an nft", () => {
          events.expectNonFungibleTokenMintEvent(
            `u${id}`,
            deployer,
            registry.identifier,
            nftAsset
          );
        });

        it("owns nft", () => {
          const owner = chain.rovOk(registry.getOwner(id));
          assertEquals(owner, deployer);
        });

        it("is registered in the registry", () => {
          const props = chain.rov(registry.getNameProperties(nameArg));
          if (!props) throw new Error("Missing name props");
          assertEquals(props.owner, deployer);
          assertEquals(props.zonefileHash, zonefile);
          assertEquals(props.registeredAt, BigInt(chain.blockHeight) - 1n);
        });

        // it("is set as primary name", () => {
        //   const name = chain.rov(registry.getPrimaryName(bob));
        //   assertEquals(name, nameArg);
        // });

        it("now is unavailable", () => {
          chain.txOk(
            contract.namePreorder({
              fqn: hashFqn(name, bytesToAscii(ns.namespace), salt),
              stxPrice: price,
              burn: true,
            }),
            charlie
          );
          const receipt = chain.txErr(
            contract.nameRegister({
              name: nameBytes,
              namespace: ns.namespace,
              zonefile,
              salt: saltBuff,
            }),
            charlie
          );
          assertEquals(receipt.value, 4001n);
        });

        it('preorder is now "claimed"', () => {
          const preorder = chain.rov(
            contract.getPreorder({
              fqn: hashFqn(name, bytesToAscii(ns.namespace), salt),
              buyer: deployer,
            })
          );
          assertEquals(preorder?.claimed, true);
        });
      });
    }

    const tests = 10;
    for (let i = 0; i < tests; i++) {
      testRandomName();
    }
  });
});
