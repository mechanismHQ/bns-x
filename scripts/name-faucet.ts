import "cross-fetch/polyfill";
import { StacksMocknet } from "micro-stacks/network";
import { config } from "dotenv";
import {
  AnchorMode,
  makeContractDeploy,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
} from "micro-stacks/transactions";
import { asciiToBytes, hexToBytes } from "micro-stacks/common";
import { readFile } from "fs/promises";
import { basename } from "path";
import { NodeProvider } from "@clarigen/node";
import { contractFactory } from "@clarigen/core";
import { contracts } from "../web/common/clarigen";

const testUtils = contractFactory(
  contracts.testUtils,
  "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.test-utils-1671039364779"
);

config();

const privateKey = process.env.DEPLOYER_KEY!;
const network = new StacksMocknet();

// const recipient = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

const [name, recipient] = process.argv.slice(2);

async function run() {
  const tx = await makeContractCall({
    ...testUtils.v1RegisterTransfer({
      namespace: asciiToBytes("testable"),
      // namespace: hexToBytes("7465737461626c65"),
      name: asciiToBytes(name),
      recipient,
    }),
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    senderKey: privateKey,
  });

  const res = await broadcastTransaction(tx, network);
  console.log("res", res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
