import "cross-fetch/polyfill";
import { StacksMocknet } from "micro-stacks/network";
import { config } from "dotenv";
import {
  AnchorMode,
  makeContractDeploy,
  broadcastTransaction,
  PostConditionMode,
} from "micro-stacks/transactions";
import { readFile } from "fs/promises";
import { basename } from "path";

config();

const privateKey = process.env.DEPLOYER_KEY!;

async function run() {
  const contractPath = "./contracts/testnet/wrapper-migrator.clar";
  const code = await readFile(contractPath, { encoding: "utf-8" });
  const network = new StacksMocknet();
  const contractName = `${basename(
    contractPath,
    ".clar"
  )}-${new Date().getTime()}`;
  const tx = await makeContractDeploy({
    // codeBody: "(ok true)",
    codeBody: code,
    // codeBody: "(ok is-in-mainnet)",
    // contractName: `test-${new Date().getTime()}`,
    contractName,
    // contractName: `${basename(contractPath, ".clar")}`,
    senderKey: privateKey,
    anchorMode: AnchorMode.Any,
    network,
    fee: 1000001,
    postConditionMode: PostConditionMode.Allow,
    // nonce: 22,
  });

  console.log(contractName);

  const res = await broadcastTransaction(tx, network);

  console.log(res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
