import { DEPLOYMENT_NETWORKS } from "@clarigen/core";

export function getDeployerAddr() {
  return "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
}

type NetworkKey = typeof DEPLOYMENT_NETWORKS[number];
export function getNetworkKey(): NetworkKey {
  const key = process.env.NETWORK_KEY;
  if (key === "mocknet") return "devnet";
  if (typeof key === "undefined") return "devnet";
  for (const type of DEPLOYMENT_NETWORKS) {
    if (type === key) return key;
  }
  throw new Error(
    `Invalid SUPPLIER_NETWORK config. Valid values are ${DEPLOYMENT_NETWORKS.join(
      ","
    )}`
  );
}
