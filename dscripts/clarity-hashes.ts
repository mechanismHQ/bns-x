import { contractPrincipalCV } from "npm:micro-stacks/clarity";
import { makeClarityHash } from "npm:micro-stacks/connect";

import { accounts } from "../artifacts/clarigen.ts";
import { bytesToHex } from "../deps.ts";
import {
  signWithKey,
  createStacksPrivateKey,
} from "npm:micro-stacks/transactions";
import { hashSha256 } from "npm:micro-stacks/crypto-sha";
import { c32addressDecode, c32checkDecode } from "npm:micro-stacks/crypto";
import { Buffer } from "npm:buffer";

const deployer = accounts.deployer.address;

const alicePK = createStacksPrivateKey(
  "7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801"
);

const names: string[] = [];
const ids: number[] = [];

for (let i = 0; i < 10; i++) {
  names.push(`wrapper-${i}`);
  ids.push(i);
}

const contracts = await Promise.all(
  names.map(async (n) => {
    const cv = contractPrincipalCV(deployer, n);
    const hash = bytesToHex(makeClarityHash(cv));
    const sig = await signWithKey(alicePK, hash);
    return {
      hash,
      signature: sig.data,
      id: `${deployer}.${n}`,
    };
  })
);

const idSigs = await Promise.all(
  ids.map(async (id) => {
    const buf = Buffer.alloc(16);
    buf.writeUIntLE(id, 0, 6);
    const encoded = Uint8Array.from(buf);
    const hash = bytesToHex(hashSha256(encoded));
    const sig = await signWithKey(alicePK, hash);
    return {
      hash,
      id,
      signature: sig.data,
    };
  })
);

console.log(
  Deno.inspect(contracts, {
    compact: false,
    strAbbreviateSize: 1000,
  })
);

console.log(
  Deno.inspect(idSigs, {
    compact: false,
    strAbbreviateSize: 1000,
  })
);

console.log("Alice pubkey hash", c32addressDecode(accounts.wallet_1.address));
