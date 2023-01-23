import { project } from "./clarigen";
import { projectFactory } from "@clarigen/core";
import { getNetworkKey } from "../constants";

export function getContracts() {
  return projectFactory(project, getNetworkKey() as unknown as "devnet");
}

export function queryHelperContract() {
  return getContracts().queryHelper;
}

export function registryContract() {
  return getContracts().bnsxRegistry;
}
