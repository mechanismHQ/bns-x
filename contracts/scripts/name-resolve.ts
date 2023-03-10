import 'cross-fetch/polyfill';
import { StacksMainnet } from 'micro-stacks/network';
import { config } from 'dotenv';
import type { StacksTransaction } from 'micro-stacks/transactions';
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
} from 'micro-stacks/transactions';
import { c32addressDecode, hashRipemd160 } from 'micro-stacks/crypto';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { asciiToBytes, bytesToHex, hexToBytes } from 'micro-stacks/common';
import { fetchAccountNonces } from 'micro-stacks/api';
import { ClarigenClient } from '@clarigen/core';

import { BnsContractsClient, parseFqn } from '@bns-x/client';

config();

const contracts = new BnsContractsClient('mainnet');

async function run() {
  const [fqn] = process.argv.slice(2);

  const { name, namespace } = parseFqn(fqn);

  const info = await contracts.client.ro(
    contracts.bnsCore.nameResolve({
      name: asciiToBytes(name),
      namespace: asciiToBytes(namespace),
    })
  );

  if (!info.isOk) {
    console.log(`${fqn} is available`);
  }
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
