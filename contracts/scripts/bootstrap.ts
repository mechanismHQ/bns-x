/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'cross-fetch/polyfill';
import { StacksMocknet } from 'micro-stacks/network';
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

config();

import {
  contracts,
  bns,
  network,
  networkKey,
  getControllerAddress,
  testnetNamespace,
  namespacePrice,
} from './script-utils';

const privateKey = process.env.DEPLOYER_KEY!;

const clarigen = new ClarigenClient(network);

async function broadcast(tx: StacksTransaction) {
  const res = await broadcastTransaction(tx, network);
  console.log('res', res);
}

const controller = getControllerAddress(privateKey);

async function waitForConstruct(): Promise<void> {
  return new Promise(function (resolve, reject) {
    void (async function tryConstruct() {
      try {
        const isExtension = await clarigen.ro(contracts.bnsxExtensions.isExtension(controller));
        console.log(`Is extension (${controller}): ${String(isExtension)}`);
        await clarigen.ro(contracts.wrapperMigratorV2.isDaoOrExtension());
        if (isExtension) return resolve();
      } catch (error) {
        console.log(`Failed to check for bootstrap status`);
        // console.error(error);
      }
      setTimeout(() => void tryConstruct(), 3000);
    })();
  });
}

async function run() {
  console.log('Waiting until network setup.');
  await waitForConstruct();
  const namespace = asciiToBytes(testnetNamespace);
  const saltHex = '01';
  const salt = hexToBytes(saltHex);
  const salted = hashRipemd160(hashSha256(hexToBytes(bytesToHex(namespace) + saltHex)));
  const deployer = contracts.bnsxExtensions.identifier.split('.')[0];
  // console.log("salted", bytesToHex(hashRipemd160(salted)));
  const nonces = await fetchAccountNonces({
    url: network.getCoreApiUrl(),
    // principal: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    principal: deployer,
  });
  let nonce = nonces.possible_next_nonce;

  console.log(network.getCoreApiUrl());
  console.log(deployer);
  console.log(nonce);
  console.log('contracts.wrapperMigrator.identifier', contracts.wrapperMigrator.identifier);
  console.log('bns.identifier', bns.identifier);
  console.log('networkKey', networkKey);

  if (networkKey === 'devnet') {
    await broadcast(
      await makeContractCall({
        ...bns.namespacePreorder(salted, namespacePrice),
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        senderKey: privateKey,
        nonce: nonce,
      })
    );
    nonce += 1;

    await broadcast(
      await makeContractCall({
        ...bns.namespaceReveal(
          namespace,
          salt,
          1000,
          10,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          networkKey === 'devnet' ? 500 : 0,
          deployer
        ),
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        senderKey: privateKey,
        nonce: nonce,
      })
    );
    nonce += 1;

    await broadcast(
      await makeContractCall({
        ...bns.namespaceReady(namespace),
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        senderKey: privateKey,
        nonce: nonce,
      })
    );
    nonce += 1;
  }

  const [_, pubHash] = c32addressDecode(deployer);

  if (networkKey === 'mainnet') {
    console.log('pubhash', bytesToHex(pubHash));
    throw new Error('safety check');
  }

  await broadcast(
    await makeContractCall({
      ...contracts.wrapperMigrator.setSigners([
        {
          signer: pubHash,
          enabled: true,
        },
      ]),
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: privateKey,
      nonce: nonce,
    })
  );
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
