import { bytesToHex, hexToBytes } from "../../../clarigen/deno-clarigen/mod.ts";
import {
  deploy,
  it,
  describe,
  contracts,
  deployer,
  assert,
  assertEquals,
} from "./helpers.ts";

const proofHex = {
  root: "0x7b4134246a3a79dd7e49599b205f1bf4190b80a6",
  leaf: "d1a70126ff7a149ca6f9b638db084480440ff842",
  proof: [
    "0x422d0010f16ae8539c53eb57a912890244a9eb5a",
    "0xa209d9355151e892895a0255555b8f6b38ae6e72",
    "0x312843f6100d1f98ae39a80a6b9eccea85c595e5",
    "0x79a206872c34e441055e4f9dd0d564584ba0eaa1",
  ],
};

function hexBytes(hex: string) {
  return hexToBytes(hex.slice(2));
}

function transformProof(data: typeof proofHex) {
  return {
    root: hexBytes(data.root),
    leaf: hexToBytes(data.leaf),
    proof: data.proof.map((p) => hexBytes(p)),
  };
}

describe("merkle proofs", () => {
  const { chain } = deploy();
  const contract = contracts.merkleTree;

  it("can verify a proof", () => {
    const valid = chain.rov(contract.processProof(transformProof(proofHex)));
    assert(valid);
  });

  it("hash-pair", () => {
    const hash = chain.rov(
      contract.hashPair(
        hexToBytes("d1a70126ff7a149ca6f9b638db084480440ff842"),
        hexToBytes("422d0010f16ae8539c53eb57a912890244a9eb5a")
      )
    );
    console.log(bytesToHex(hash));
  });
});
