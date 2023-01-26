import { project } from "./clarigen";
import { projectFactory } from "@clarigen/core";
import { ClarigenNodeClient } from "@clarigen/node";
import { getNetwork, getNetworkKey } from "../constants";

export function getContracts() {
  return projectFactory(project, getNetworkKey() as unknown as "devnet");
}

export function queryHelperContract() {
  return getContracts().queryHelper;
}

export function registryContract() {
  return getContracts().bnsxRegistry;
}

export function registryContractAsset() {
  const contract = registryContract();
  const nft = contract.non_fungible_tokens[0].name;
  return `${contract.identifier}::${nft}`;
}

export function clarigenProvider() {
  const network = getNetwork();
  const clarigen = new ClarigenNodeClient(network);
  return clarigen;
}
