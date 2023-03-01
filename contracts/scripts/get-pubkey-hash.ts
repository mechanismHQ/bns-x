import { bytesToHex } from 'micro-stacks/common';
import { c32addressDecode } from 'micro-stacks/crypto';
import { deployments } from '@bns-x/core';

for (const [network, deployer] of Object.entries(deployments.bnsxRegistry)) {
  const [addr] = deployer.split('.');
  const [_, pubhash] = c32addressDecode(addr);

  console.log(network, addr, bytesToHex(pubhash));
}
