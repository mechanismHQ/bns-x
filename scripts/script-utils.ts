import "cross-fetch/polyfill";
import { project, contracts as _contracts } from "../web/common/clarigen";
import { projectFactory, contractFactory } from "@clarigen/core";
import {
  StacksMainnet,
  StacksMocknet,
  StacksNetwork,
  StacksTestnet,
} from "micro-stacks/network";

export let networkKey: "devnet" | "testnet" | "mainnet" = "devnet";
export let network: StacksNetwork = new StacksMocknet();
const networkKeyEnv = process.env.NETWORK_KEY;
if (networkKeyEnv === "testnet") {
  networkKey = "testnet";
  network = new StacksTestnet();
} else if (networkKeyEnv === "mainnet") {
  networkKey = "mainnet";
  network = new StacksMainnet();
}

export const contracts = projectFactory(project, networkKey);

export const bns = contractFactory(
  _contracts.bnsV1,
  "ST000000000000000000002AMW42H.bns"
);
