import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { registerNameV1 } from "./bns-helpers.ts";
import {
  deploy,
  describe,
  it,
  hexToBytes,
  bytesToHex,
  deployWithNamespace,
  alice,
  bns,
  registry,
  nftAsset,
  bob,
  asciiToBytes,
  ASCII_ENCODING,
  btcBytes,
} from "./helpers.ts";
// import { standardPrincipalCV, tupleCV } from "npm:micro-stacks/clarity";
// import {
//   makeClarityHash,
//   makeDomainTuple,
//   makeStructuredDataHash,
// } from "npm:micro-stacks/connect";
// import { getPublicKey } from "npm:micro-stacks/crypto";
// import { makeRandomPrivKey, signWithKey } from "npm:micro-stacks/transactions";

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

describe("migrating legacy names", () => {
  const { chain, contracts } = deployWithNamespace();
  const contract = contracts.migrator;

  describe("alice migrates alice.btc", () => {
    it("alice has legacy name", () => {
      registerNameV1({
        chain,
        name: "alice",
        owner: alice,
      });
    });

    let leaseStart: bigint;

    it("can get legacy name", () => {
      const name = chain.rovOk(contract.getLegacyName(alice));
      assertEquals(name.owner, alice);
      assertEquals(name.leaseStartedAt, BigInt(chain.blockHeight - 1));
      leaseStart = name.leaseStartedAt;
    });

    it("alice migrates", () => {
      const receipt = chain.txOk(contract.migrate(), alice);

      assertEquals(receipt.value.id, 0n);

      receipt.events.expectNonFungibleTokenMintEvent(
        "u0",
        alice,
        registry.identifier,
        nftAsset
      );
    });
  });

  describe("migrate-name flow", () => {
    it("bob has legacy name", () => {
      registerNameV1({
        chain,
        name: "bob",
        owner: bob,
      });
    });

    it("bob migrates", () => {
      const receipt = chain.txOk(
        contract.migrateName({
          name: asciiToBytes("bob"),
          namespace: btcBytes,
        }),
        bob
      );

      receipt.events.expectNonFungibleTokenMintEvent(
        "u1",
        bob,
        registry.identifier,
        nftAsset
      );
    });

    it("bob owns name in registry", () => {
      const name = chain.rov(registry.getPrimaryName(bob))!;
      assertEquals(name.name, asciiToBytes("bob"));
      assertEquals(name.namespace, btcBytes);
      assertEquals(name.encoding, ASCII_ENCODING);
    });

    it("bob cannot migrate again", () => {
      const receipt = chain.txErr(
        contract.migrateName({
          name: asciiToBytes("bob"),
          namespace: btcBytes,
        }),
        bob
      );

      assertEquals(receipt.value, 4001n);
    });
  });
});

// Clarinet can't yet run npm
//
// async function makeSignature(recipient: string) {
//   const privateKey = makeRandomPrivKey();
//   const domain = makeClarityHash(makeDomainTuple("migrator", "0.0.1", 1));
//   const message = makeClarityHash(
//     tupleCV({
//       recipient: standardPrincipalCV(
//         "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5"
//       ),
//     })
//   );
//   const hashBytes = makeStructuredDataHash(domain, message);
//   console.log(bytesToHex(hashBytes));

//   const signature = await signWithKey(privateKey, bytesToHex(hashBytes));
//   return hexToBytes(signature.data);
// }

// describe("message verification", () => {
//   const { chain, contracts, accounts } = deploy();
//   const contract = contracts.migrator;

//   const [alice, bob] = accounts.addresses("wallet_1", "wallet_2");

//   it("can verify migration to alice", async () => {
//     const signature = await makeSignature(alice);
//     const data = chain.rovOk(
//       contract.verifyMigrationSignature({
//         signature,
//         recipient: alice,
//       })
//     );
//     assertEquals(data.recipient, alice);
//   });

//   const sig =
//     "006f69ce4b33c8488d53a1d05a2e3ca6e09145f143f9ac7b66b3111b69205a25826838833eed6fc04814cfa244c683ecfc9f9527dfa4414d65e0282eecead95746";
//   const pk =
//     "024067ca174ea23959fc8e00024912add242e7f007f8953a333eb047a15906da92";

//   it("can verify structured signature", () => {
//     // const data = chain.rov(contract.createMessageBytes());
//     const signer = chain.rovOk(
//       contract.verifyMessageTest(hexToBytes(signatureVrsToRsv(sig)))
//     );
//     assertEquals(bytesToHex(signer), pk);
//   });
// });
