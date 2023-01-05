import { registerNameV1 } from "../bns-helpers.ts";
import {
  deployWithNamespace,
  describe,
  alice,
  bob,
  it,
  asciiToBytes,
  assertEquals,
  btcBytes,
} from "../helpers.ts";

describe("revoking an nft on v1", () => {
  const { chain, contracts, bns } = deployWithNamespace();

  const nameObj = {
    name: asciiToBytes("alice"),
    namespace: asciiToBytes("id"),
  };

  it("alice buys alice.id", () => {
    registerNameV1({
      chain,
      owner: alice,
      name: "alice",
      namespace: "id",
    });
  });

  it("resolves to alice", () => {
    const info = chain.rovOk(bns.nameResolve(nameObj));
    console.log(info);

    assertEquals(info.owner, alice);
  });

  it("after expiration", () => {
    const info = chain.rovOk(bns.nameResolve(nameObj));
    chain.mineEmptyBlockUntil(info.leaseEndingAt! + 5001n);
  });

  // it("is revoked", () => {
  //   chain.txOk(bns.nameRevoke(nameObj), alice);

  //   // assertEquals(chain.rovOk(bns.nameResolve(nameObj)), alice);
  //   const err = chain.rovErr(bns.nameResolve(nameObj));
  //   assertEquals(err, 2014n);
  // });

  it("cannot be registered now", () => {
    console.log(chain.blockHeight);
    const isExpired = chain.rov(bns.isNameLeaseExpired(nameObj));
    console.log("isExpired", isExpired);
    const receipt = registerNameV1({
      chain,
      name: "alice",
      owner: bob,
      namespace: "id",
    });
    console.log(receipt.events);
  });

  it("get props", () => {
    const info = chain.rovOk(bns.nameResolve(nameObj));
    console.log("info", info);
  });
});
