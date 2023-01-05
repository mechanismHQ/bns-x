import "cross-fetch/polyfill";
import { NodeProvider } from "@clarigen/node";
import {
  projectFactory,
  DEPLOYMENT_NETWORKS,
  contractFactory,
} from "@clarigen/core";
import { contracts } from "./clarigen";
import { StacksMainnet } from "micro-stacks/network";
import {
  asciiToBytes,
  bytesToAscii,
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
} from "micro-stacks/common";
import {
  hexToCV,
  deserializeCV,
  cvToHex,
  stringAsciiCV,
  bufferCV,
} from "micro-stacks/clarity";

const bns = contractFactory(
  contracts.bnsV1,
  "SP000000000000000000002Q6VF78.bns"
);

const network = new StacksMainnet();

const provider = NodeProvider({
  network,
});

async function run() {
  const nameInfo = await provider.roOk(
    bns.nameResolve({
      namespace: asciiToBytes("btc"),
      name: asciiToBytes("hank"),
    })
  );
  const { zonefileHash } = nameInfo;
  const url = `https://stacks-node-api.mainnet.stacks.co:20443/v2/attachments/${bytesToHex(
    zonefileHash
  )}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(res.headers);
  // console.log(await res.json());
  const data = await res.json();
  console.log(data);
  console.log(deserializeCV(hexToBytes(data)));
  // const zf = bytesToAscii(hexToBytes(data));
  // console.log(zf);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
