import { bytesToHex } from "micro-stacks/common";
import { c32addressDecode } from "micro-stacks/crypto";
import { deployments } from "../web/common/clarigen";

for (const network in deployments.bnsxRegistry) {
  if (Object.prototype.hasOwnProperty.call(deployments.bnsxRegistry, network)) {
    const [addr] = deployments.bnsxRegistry[network].split(".");
    const [_, pubhash] = c32addressDecode(addr);

    console.log(network, addr, bytesToHex(pubhash));
  }
}
