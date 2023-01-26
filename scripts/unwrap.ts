import { project, contracts as _contracts } from "../web/common/clarigen";
import { contracts, bns, network, networkKey } from "./script-utils";
import { ClarigenNodeClient } from "@clarigen/node";
import { contractFactory } from "@clarigen/core";
import {
  AnchorMode,
  broadcastTransaction,
  makeContractCall,
  PostConditionMode,
} from "micro-stacks/transactions";
import { asciiToBytes, bytesToAscii } from "micro-stacks/common";

const clarigen = new ClarigenNodeClient(network);
const registry = contracts.bnsxRegistry;

const privateKey = process.env.DEPLOYER_KEY!;

const [wrapperId, recipient] = process.argv.slice(2);

const contract = contractFactory(_contracts.nameWrapper, wrapperId);

async function run() {
  console.log("contract.identifier", contract.identifier);
  console.log("recipient", recipient);

  const name = await clarigen.roOk(contract.getOwnName());
  console.log("unwrapping:");
  console.log(bytesToAscii(name.name), bytesToAscii(name.namespace));

  const tx = await makeContractCall({
    ...contract.unwrap(recipient),
    anchorMode: AnchorMode.Any,
    senderKey: privateKey,
    postConditionMode: PostConditionMode.Allow,
    network,
    // nonce: 17,
  });

  const res = await broadcastTransaction(tx, network);
  console.log(res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
