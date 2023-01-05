import {
  bytesToHex,
  hexToBytes,
  tx,
} from "../../../../clarigen/deno-clarigen/mod.ts";
import {
  asciiToBytes,
  assertEquals,
  Chain,
  deploy,
  describe,
  err,
  factory,
  hashFqn,
  hashSalt,
  it,
  simnet,
  txOk,
} from "../helpers.ts";

const namespaceTtl = 144;

describe("BNS Test suite - NAME_PREORDER", () => {
  const { chain, accounts, bns } = deploy();
  const [alice, bob, charlie, dave] = accounts.addresses(
    "wallet_1",
    "wallet_2",
    "wallet_3",
    "wallet_4"
  );

  const cases = [
    {
      namespace: "blockstack",
      version: 1,
      salt: "0000",
      value: 640000000,
      namespaceOwner: alice,
      nameOwner: bob,
      priceFunction: {
        buckets: [7, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] as const,
        base: 4,
        coeff: 250,
        noVowelDiscount: 4,
        nonAlphaDiscount: 4,
      },
      renewalRule: 10,
      nameImporter: alice,
      zonefile: "0000",
    } as const,
    {
      namespace: "id",
      version: 1,
      salt: "0000",
      value: 64000000000,
      namespaceOwner: alice,
      nameOwner: bob,
      priceFunction: {
        buckets: [6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        base: 4,
        coeff: 250,
        noVowelDiscount: 20,
        nonAlphaDiscount: 20,
      },
      renewalRule: 52595,
      nameImporter: alice,
      zonefile: "1111",
    },
  ] as const;

  const [blockstack, id] = cases;

  it("registers .blockstack namespace", () => {
    const hash = hashSalt(blockstack.namespace, blockstack.salt);
    const receipt = chain.txOk(
      bns.namespacePreorder({
        stxToBurn: blockstack.value,
        hashedSaltedNamespace: hash,
      }),
      blockstack.namespaceOwner
    );
    const exp = receipt.value;
    assertEquals(exp, BigInt(chain.blockHeight + namespaceTtl - 1));

    // const reveal = chain.txOk(
    //   bns.namespaceReveal(
    //     asciiToBytes(blockstack.namespace),
    //     hexToBytes(blockstack.salt),
    //     blockstack.priceFunction.base,
    //     blockstack.priceFunction.coeff,
    //     ...blockstack.priceFunction.buckets,
    //     blockstack.priceFunction.nonAlphaDiscount,
    //     blockstack.priceFunction.noVowelDiscount,
    //     blockstack.renewalRule,
    //     blockstack.nameImporter
    //   ),
    //   blockstack.namespaceOwner
    // );

    chain.mine(
      tx(
        bns.namespaceReveal(
          asciiToBytes(blockstack.namespace),
          hexToBytes(blockstack.salt),
          blockstack.priceFunction.base,
          blockstack.priceFunction.coeff,
          ...blockstack.priceFunction.buckets,
          blockstack.priceFunction.nonAlphaDiscount,
          blockstack.priceFunction.noVowelDiscount,
          blockstack.renewalRule,
          blockstack.nameImporter
        ),
        blockstack.namespaceOwner
      ),
      tx(
        bns.namespaceReady(asciiToBytes(blockstack.namespace)),
        blockstack.namespaceOwner
      )
    );
  });

  const hashed = hashFqn("bob", blockstack.namespace, blockstack.salt);

  it("fails if not enough stx", () => {
    const max = accounts.get("wallet_2").balance;

    const receipt = chain.txErr(
      bns.namePreorder({
        stxToBurn: BigInt(max) + 1n,
        hashedSaltedFqn: hashed,
      }),
      bob
    );
    assertEquals(receipt.value, 4001n);
  });

  it("can be pre-ordered by the same people", () => {
    const now = chain.blockHeight;
    const bobReceipt = chain.txOk(
      bns.namePreorder({
        stxToBurn: 200,
        hashedSaltedFqn: hashed,
      }),
      bob
    );
    assertEquals(Number(bobReceipt.value), now + namespaceTtl);

    const aliceReceipt = chain.txOk(
      bns.namePreorder({
        stxToBurn: 200,
        hashedSaltedFqn: hashed,
      }),
      alice
    );
    assertEquals(Number(aliceReceipt.value), now + namespaceTtl + 1);
  });

  it("cant be preordered by bob again", () => {
    const bobReceipt = chain.txErr(
      bns.namePreorder({
        stxToBurn: 200,
        hashedSaltedFqn: hashed,
      }),
      bob
    );
    assertEquals(bobReceipt.value, 2016n);
  });

  it("can be preordered again after expiration", () => {
    chain.mineEmptyBlock(144);
    chain.txOk(
      bns.namePreorder({
        stxToBurn: 200 * 1000000,
        hashedSaltedFqn: hashed,
      }),
      bob
    );
  });

  it("name can be revealed", () => {
    chain.txOk(
      bns.nameRegister({
        name: asciiToBytes("bob"),
        namespace: asciiToBytes(blockstack.namespace),
        salt: hexToBytes(blockstack.salt),
        zonefileHash: hexToBytes(""),
      }),
      bob
    );
  });
});
