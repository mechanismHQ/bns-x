import "cross-fetch/polyfill";
import { StacksMocknet } from "micro-stacks/network";
import { config } from "dotenv";
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
} from "micro-stacks/transactions";
import { contractFactory } from "@clarigen/core";
import { contracts, deployments } from "../web/common/clarigen";

const migrator = contractFactory(
  contracts.wrapperMigrator,
  deployments.wrapperMigrator.devnet
);

config();

const privateKey = process.env.DEPLOYER_KEY!;
const network = new StacksMocknet();

// const recipient = "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";

const [signer] = process.argv.slice(2);

async function run() {
  const tx = await makeContractCall({
    ...migrator.setSigners([
      {
        signer: signer ?? "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
        enabled: true,
      },
    ]),
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
