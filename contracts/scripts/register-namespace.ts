import "cross-fetch/polyfill";
import { StacksMainnet } from "micro-stacks/network";
import { config } from "dotenv";
import {
  AnchorMode,
  broadcastTransaction,
  PostConditionMode,
  makeContractCall,
  StacksTransaction,
} from "micro-stacks/transactions";
import {
  c32addressDecode,
  hashRipemd160,
  privateKeyToStxAddress,
  StacksNetworkVersion,
} from "micro-stacks/crypto";
import { hashSha256 } from "micro-stacks/crypto-sha";
import { asciiToBytes, bytesToHex, hexToBytes } from "micro-stacks/common";
import { fetchAccountNonces } from "micro-stacks/api";
import { contracts } from "../web/common/clarigen";
import { contractFactory } from "@clarigen/core";
import { ClarigenNodeClient } from "@clarigen/node";

config();

const privateKey = process.env.NAMESPACE_KEY!;

const network = new StacksMainnet();

const bns = contractFactory(
  contracts.bnsV1,
  "SP000000000000000000002Q6VF78.bns"
);

const NAMESPACE = "your-namespace-here";

function getControllerAddress() {
  const version = StacksNetworkVersion.mainnetP2PKH;
  if (privateKey.length === 66) {
    const key = privateKey.slice(0, 64);
    const isCompressed = privateKey.slice(64) === "01";
    return privateKeyToStxAddress(key, version, isCompressed);
  }
  return privateKeyToStxAddress(privateKey, version, false);
}

async function broadcast(tx: StacksTransaction) {
  const res = await broadcastTransaction(tx, network);
  console.log("res", res);
}

async function run() {
  const namespace = asciiToBytes(NAMESPACE);
  const salt = hexToBytes("00");
  const salted = hashRipemd160(
    hashSha256(hexToBytes(bytesToHex(namespace) + "00"))
  );

  const controller = getControllerAddress();

  const nonces = await fetchAccountNonces({
    url: network.getCoreApiUrl(),
    principal: controller,
  });

  const nonce = nonces.possible_next_nonce;
  const clarigen = new ClarigenNodeClient(network);

  const price = await clarigen.roOk(bns.getNamespacePrice(namespace));

  console.log(`Price is ${price} uSTX`);

  console.log(`Controller is`, controller);
  console.log(`Namespace is`, NAMESPACE);

  // PREORDER
  const preorderTx = await makeContractCall({
    ...bns.namespacePreorder(salted, price),
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    senderKey: privateKey,
    nonce: nonce,
  });

  // await broadcast(preorderTx);

  const revealTx = await makeContractCall({
    ...bns.namespaceReveal(
      namespace,
      salt,
      // Price function vars:
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
      controller
    ),
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    senderKey: privateKey,
    nonce: nonce,
  });

  // await broadcast(revealTx);
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
