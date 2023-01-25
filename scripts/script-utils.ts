import "cross-fetch/polyfill";
import { project, contracts as _contracts } from "../web/common/clarigen";
import { projectFactory, contractFactory } from "@clarigen/core";
import {
  StacksMocknet,
  StacksNetwork,
  StacksTestnet,
} from "micro-stacks/network";

export let networkKey: "devnet" | "testnet" = "devnet";
export let network: StacksNetwork = new StacksMocknet();
if (process.env.NETWORK_KEY === "testnet") {
  networkKey = "testnet";
  network = new StacksTestnet();
}

export const contracts = projectFactory(project, networkKey);

export const bns = contractFactory(
  _contracts.bnsV1,
  "ST000000000000000000002AMW42H.bns"
);
