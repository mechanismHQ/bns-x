import { contracts, bns, network, networkKey } from "./script-utils";
import { ClarigenNodeClient } from "@clarigen/node";
import {
  AnchorMode,
  broadcastTransaction,
  makeContractCall,
} from "micro-stacks/transactions";

const clarigen = new ClarigenNodeClient(network);
const registry = contracts.bnsxRegistry;

const privateKey = process.env.DEPLOYER_KEY!;

async function run() {
  console.log("networkKey", networkKey);
  const uri = "https://api.bns.xyz/nft-metadata/{id}";
  const tokenUri = await clarigen.ro(registry.getTokenUri());

  console.log("existing tokenUri", tokenUri);

  const tx = await makeContractCall({
    ...registry.daoSetTokenUri(uri),
    senderKey: privateKey,
    anchorMode: AnchorMode.Any,
    network,
  });

  const res = await broadcastTransaction(tx, network);
  console.log("res", res);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
