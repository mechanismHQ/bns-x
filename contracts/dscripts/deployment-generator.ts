import { types } from "../deps.ts";
import { contracts, bns } from "../tests/helpers.ts";
import { asciiToBytes, hexToBytes, bytesToHex } from "npm:micro-stacks/common";
import { hashRipemd160 } from "npm:micro-stacks/crypto";
import { hashSha256 } from "npm:micro-stacks/crypto-sha";

const namespace = asciiToBytes("testable");

const salt = hexToBytes("00");
const salted = hashRipemd160(
  hashSha256(hexToBytes(bytesToHex(namespace) + "00"))
);

const reveal = bns.namespaceReveal(
  namespace,
  salt,
  1000,
  10,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
);

reveal.args.forEach((a) => {
  console.log(`- ${a}`);
});
