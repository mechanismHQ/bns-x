import {
  assert,
  assertExists,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { hexToBytes } from "../../../clarigen/deno-clarigen/mod.ts";
import { registerNameV1 } from "./bns-helpers.ts";
import {
  deployWithNamespace,
  describe,
  it,
  assertEquals,
  asciiToBytes,
  hashSalt,
  ASCII_ENCODING,
  nftAsset,
  btcBytes,
} from "./helpers.ts";

const salt = "0000";
const saltBuff = hexToBytes(salt);
const zonefile = hexToBytes("0000000000000000000000000000000000000000");

describe("ascii.btc", () => {
  const { chain, contracts, accounts } = deployWithNamespace();
  const contract = contracts.asciiBtcRegistrar;
  const bnsTest = contracts.bnsV1;
  const registry = contracts.nameRegistry;
  // console.log(bytesToHex(btcBytes));

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
            contract.getHashedSaltedFqn(asciiToBytes(name), hexToBytes(salt))
          ),
          hashSalt(name, salt)
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
      const fqn = hashSalt("alice", salt);
      chain.txOk(contract.namePreorder(fqn), bob);

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

    chain.txOk(
      contract.namePreorder({
        fqn: hashSalt(name, salt),
      }),
      bob
    );

    const receipt = chain.txErr(
      contract.nameRegister({
        name: nameBytes,
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
      chain.txOk(contract.namePreorder(hashSalt(name, salt)), bob);

      const receipt = chain.txOk(
        contract.nameRegister({
          name: nameBytes,
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
      chain.txOk(contract.namePreorder(hashSalt(name, salt)), charlie);
      const receipt = chain.txErr(
        contract.nameRegister({
          name: nameBytes,
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
          fqn: hashSalt(name, salt),
          buyer: bob,
        })
      );
      assertEquals(preorder?.claimed, true);
    });
  });
});
