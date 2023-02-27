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
const name = "blind-worm";

const zonefile = `$ORIGIN ${name}.testable.\n$TTL 3600\n_http._tcp\tIN\tURI\t10\t1\t"https://gaia.blockstack.org/hub/13WcjxWGz3JkZYhoPeCHw2ukcK1f1zH6M1/profile.json"\n\n`;

async function run() {
  const zonefileBytes = utf8ToBytes(zonefile);
  const zonefileHash = hashRipemd160(hashSha256(zonefileBytes));
  const call = bns.nameUpdate({
    namespace: asciiToBytes("testable"),
    name: asciiToBytes(name),
    zonefileHash,
  });
  const tx = await makeContractCall({
    ...call,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    senderKey: privateKey,
  });

  const res = await broadcastTransaction(tx, network, zonefileBytes);
  console.log("res", res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
