import { bytesToHex, hexToBytes } from "micro-stacks/common";
import { makeClarityHash } from "micro-stacks/connect";
import { getRandomBytes, ripemd160 } from "micro-stacks/crypto";
import { hashSha256 } from "micro-stacks/crypto-sha";
import { MerkleTree } from "merkletreejs";

function makeLeaves() {
  const leaves: Uint8Array[] = [];

  const numLeafs = 10;

  for (let i = 0; i < numLeafs; i++) {
    const bytes: number[] = [];
    for (let n = 0; n < 32; n++) {
      bytes.push(i);
    }
    leaves.push(ripemd160(new Uint8Array(bytes)));
  }
  return leaves;
}

function makeTree() {
  const leaves = makeLeaves();

  const hashes: Uint8Array[] = [...leaves];

  let n = BigInt(leaves.length);
  let offset = 0n;

  while (n > 0) {
    for (let i = 0n; i < n - 1n; i += 2n) {
      console.log(offset, i, n);
      const leaf = new Uint8Array([
        ...hashes[Number(offset + i)],
        ...hashes[Number(offset + i + 1n)],
      ]);
      hashes.push(ripemd160(leaf));
    }
    offset += n;
    n = n / 2n;
  }

  console.log(hashes.length);

  const hex = hashes.map((h) => bytesToHex(h));

  console.log(JSON.stringify(hex));
}

function hash(bytes: Uint8Array) {
  return ripemd160(hashSha256(bytes));
}

const leaves = makeLeaves();

function concat(a: Uint8Array, b: Uint8Array) {
  // return hexToBytes(`${bytesToHex(a)}${bytesToHex(b)}`);
  return new Uint8Array([...a, ...b]);
}

// console.log("manual:");
// console.log(bytesToHex(hash(concat(leaves[1], leaves[0]))));

const merkleTree = new MerkleTree(leaves, hash, { sortPairs: true });
console.log(merkleTree.getHexLayers());

console.log(bytesToHex(merkleTree.getRoot()));

console.log(merkleTree.getHexProof(leaves[0]));
merkleTree.print();

console.log({
  root: merkleTree.getHexRoot(),
  leaf: bytesToHex(leaves[0]),
  proof: merkleTree.getHexProof(leaves[0]),
});

// makeTree();

// const tree = [
//   "d1a70126ff7a149ca6f9b638db084480440ff842",
//   "422d0010f16ae8539c53eb57a912890244a9eb5a",
//   "e8742ef70e66dd34014e45b847d923eee48b2403",
//   "7dd7f871ad14950c1933f65611df24e9ae02433f",
//   "467a5fcc05787ffa9ba8d20a5ff732e2af97fcf4",
//   "184f0bc2046b560ad6b6b6180726d023a2ff3987",
//   "d8e89e39976db5cb67eee655cf264dee79fe2831",
//   "8a82f7562a7b7c9beca3ae2a43ce1080b2457039",
//   "8c1be1e43b4229cac5e01e9071f51583569cd6ac",
//   "3bbb97564b7d14f72ef4eb4446835e4fd82e2796",
//   "762d68da8767b420c3e8e19f5257363ec21cf955",
//   "eae698eb302effc9928734c2322b0c39ce2aae95",
//   "d2b33612ccd7094d907692257f507fe2bd87b5ec",
//   "f6c997e8e5c67562fe832f21ac049b1a9c05ff50",
//   "2fdee9debb9509bdb3558b3b4ce2b4ecaff3b069",
//   "2cead682bb222c5d8965202a1a6de51cdf862c13",
//   "5d69475f4597be3a920a7c338f90988a034c7a85",
//   "c0eb7d660af9a4eea60abee1445cfdd74a22a4be",
// ];

// const root = tree[tree.length - 1];
