import "cross-fetch/polyfill";
import { StacksMocknet } from "micro-stacks/network";
import { config } from "dotenv";
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
} from "micro-stacks/transactions";
import { contracts } from "./script-utils";
import { contracts as _contracts } from "../web/common/clarigen";
import { contractFactory } from "@clarigen/core";
import { hashRipemd160 } from "micro-stacks/crypto";
import { hashSha256 } from "micro-stacks/crypto-sha";
import { asciiToBytes, utf8ToBytes } from "micro-stacks/common";

const { bnsxExtensions } = contracts;

const wrapper = contractFactory(
  _contracts.nameWrapper,
  "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG.name-wrapper-634"
);

const bns = contractFactory(
  _contracts.bnsV1,
  "ST000000000000000000002AMW42H.bns"
);

config();

const privateKey = process.env.WALLET_2_KEY!;
const network = new StacksMocknet();
const name = "grim-alligator";

const contractName = "onchain-resolver-1673288207749";

// const resolver = contractFactory(
//   _contracts.onchainResolver,
//   `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.${contractName}`
// );

async function run() {
  const bytesLength = 102400;
  const bytes = Array(bytesLength).fill(0);
  const zonefile = new Uint8Array(bytes);

  // const tx = await makeContractCall({
  //   ...resolver.emitZonefile(zonefile),
  //   senderKey: privateKey,
  //   anchorMode: AnchorMode.Any,
  //   network,
  // });

  // const res = await broadcastTransaction(tx, network);
  // console.log(res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
