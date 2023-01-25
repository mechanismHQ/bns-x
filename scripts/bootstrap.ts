import "cross-fetch/polyfill";
import { StacksMocknet } from "micro-stacks/network";
import { config } from "dotenv";
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
  StacksTransaction,
} from "micro-stacks/transactions";
import { c32addressDecode, hashRipemd160 } from "micro-stacks/crypto";
import { hashSha256 } from "micro-stacks/crypto-sha";
import { asciiToBytes, bytesToHex, hexToBytes } from "micro-stacks/common";
import { fetchAccountNonces } from "micro-stacks/api";

config();

import { contracts, bns, network } from "./script-utils";

const privateKey = process.env.DEPLOYER_KEY!;

async function broadcast(tx: StacksTransaction) {
  const res = await broadcastTransaction(tx, network);
  console.log("res", res);
}

async function run() {
  const namespace = asciiToBytes("testable");
  const salt = hexToBytes("00");
  const salted = hashRipemd160(
    hashSha256(hexToBytes(bytesToHex(namespace) + "00"))
  );
  const deployer = contracts.bnsxExtensions.identifier.split(".")[0];
  // console.log("salted", bytesToHex(hashRipemd160(salted)));
  const nonces = await fetchAccountNonces({
    url: network.getCoreApiUrl(),
    // principal: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    principal: deployer,
  });
  const nonce = nonces.possible_next_nonce - 1;

  if (process.argv.length < 10) {
    console.log(network.getCoreApiUrl());
    console.log(deployer);
    console.log(nonce);
    throw new Error("safe exit - comment if ready");
  }

  // const tx = await makeContractCall({
  //   ...executorDao.construct(contracts.proposalBootstrap.identifier),
  //   network,
  //   anchorMode: AnchorMode.Any,
  //   postConditionMode: PostConditionMode.Allow,
  //   senderKey: privateKey,
  //   nonce,
  // });
  // await broadcast(tx);

  await broadcast(
    await makeContractCall({
      ...bns.namespacePreorder(salted, 640000000),
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: privateKey,
      nonce: nonce + 1,
    })
  );

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
        0,
        deployer
      ),
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: privateKey,
      nonce: nonce + 2,
    })
  );

  await broadcast(
    await makeContractCall({
      ...bns.namespaceReady(namespace),
      network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      senderKey: privateKey,
      nonce: nonce + 3,
    })
  );

  const [_, pubHash] = c32addressDecode(deployer);

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
      nonce: nonce + 4,
    })
  );
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
