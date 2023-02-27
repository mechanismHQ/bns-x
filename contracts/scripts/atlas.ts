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
import { asciiToBytes, bytesToHex, utf8ToBytes } from "micro-stacks/common";

const { bnsxExtensions } = contracts;

const wrapper = contractFactory(
  _contracts.nameWrapper,
  "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG.name-wrapper-1380"
);

const bns = contractFactory(
  _contracts.bnsV1,
  "ST000000000000000000002AMW42H.bns"
);

config();

const privateKey = process.env.WALLET_2_KEY!;
const network = new StacksMocknet();
const name = "blind-worm";
// const name = "drunk-swallow";
const zonefile = `$ORIGIN ${name}.testable.\n$TTL 3600\n_http._tcp\tIN\tURI\t10\t1\t"hi"\n\n`;

async function run() {
  const zonefileBytes = utf8ToBytes(zonefile);
  const zonefileHash = hashRipemd160(hashSha256(zonefileBytes));
  async function saveZonefile() {
    const call = wrapper.nameUpdate({
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

  async function fetchZonefile() {
    const urlBase = `${network.getCoreApiUrl()}/v2/attachments/${bytesToHex(
      zonefileHash
    )}`;

    const res = await fetch(urlBase);

    const text = await res.text();

    console.log(text);
  }

  // await fetchZonefile();
  await saveZonefile();
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
