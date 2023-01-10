import {
  describe,
  it,
  deployWithNamespace,
  contracts,
  alice,
  utilsRegisterBtc,
  assertEquals,
  utf8ToBytes,
  bob,
} from "./helpers.ts";

const contract = contracts.onchainResolver;

function makeBuff(len: number) {
  const bytes = Array(len).fill(0);
  return new Uint8Array(bytes);
}

describe("storing zonefiles onchain", () => {
  const { chain: t } = deployWithNamespace();

  it("can emit", () => {
    const bytesLength = 102400;
    const zonefile = makeBuff(bytesLength);
    const receipt = t.txOk(contract.emitZonefile(zonefile), alice);
  });

  const aliceId = 0n;

  it("alice can set zonefile for her name", () => {
    utilsRegisterBtc({
      name: "alice",
      owner: alice,
      chain: t,
    });

    const zonefile = makeBuff(2048);
    t.txOk(contract.setZonefile(aliceId, zonefile), alice);
  });

  it("can fetch zonefile", () => {
    const zf = t.rov(contract.resolveZonefile(aliceId));
    assertEquals(zf, makeBuff(2048));
  });

  it("alice can change zonefile", () => {
    const zf = utf8ToBytes("hello world");
    t.txOk(contract.setZonefile(aliceId, zf), alice);

    assertEquals(t.rov(contract.resolveZonefile(aliceId)), zf);
  });

  it("only owner can set zonefile", () => {
    const receipt = t.txErr(contract.setZonefile(aliceId, makeBuff(2)), bob);
    assertEquals(receipt.value, contract.constants.ERR_UNAUTHORIZED.value);
  });

  it("cannot set zonefile for nonexistant name", () => {
    const receipt = t.txErr(contract.setZonefile(1n, makeBuff(2)), alice);
    assertEquals(receipt.value, contract.constants.ERR_UNAUTHORIZED.value);
  });
});
