import { contractPrincipalCV } from "npm:micro-stacks/clarity";
import { makeClarityHash } from "npm:micro-stacks/connect";

import { accounts } from "../artifacts/clarigen.ts";
import { bytesToHex } from "../deps.ts";
import {
  signWithKey,
  createStacksPrivateKey,
} from "npm:micro-stacks/transactions";

const deployer = accounts.deployer.address;

const alicePK = createStacksPrivateKey(
  "7287ba251d44a4d3fd9276c88ce34c5c52a038955511cccaf77e61068649c17801"
);

const names: string[] = [];

for (let i = 0; i < 10; i++) {
  names.push(`wrapper-${i}`);
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

console.log(
  Deno.inspect(contracts, {
    compact: false,
    strAbbreviateSize: 1000,
  })
);
