import "cross-fetch/polyfill";
import { project, contracts as _contracts } from "../web/common/clarigen";
import { projectFactory, contractFactory } from "@clarigen/core";

export const contracts = projectFactory(project, "devnet");

export const bns = contractFactory(
  _contracts.bnsV1,
  "ST000000000000000000002AMW42H.bns"
);
