import * as btc from '@scure/btc-signer';
import { deployments } from '@bns-x/core';
import type { DeploymentNetwork } from '@clarigen/core';
import { makeClarityHash } from 'micro-stacks/connect';
import { principalCV, stringAsciiCV, tupleCV } from 'micro-stacks/clarity';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { getBtcNetwork } from './btc-networks';

export function getBurnRedeemScriptForRecipient(
  recipient: string,
  network: DeploymentNetwork = 'mainnet'
) {
  const bridge = deployments.l1BridgeV1[network];
  if (typeof bridge !== 'string') {
    throw new Error('Unable to find bridge address for network ' + network);
  }

  const hashData = tupleCV({
    topic: stringAsciiCV('burn'),
    recipient: principalCV(recipient),
    bridge: principalCV(bridge),
  });

  const hash = ripemd160(makeClarityHash(hashData));

  const script = btc.Script.encode([hash, 'DROP', 0]);

  return script;
}

export function getBurnOutputForRecipient(
  recipient: string,
  network: DeploymentNetwork = 'mainnet'
) {
  const script = getBurnRedeemScriptForRecipient(recipient, network);

  return btc.OutScript.encode({
    type: 'wsh',
    hash: sha256(script),
  });
}

export function getBurnAddressForRecipient(
  recipient: string,
  network: DeploymentNetwork = 'mainnet'
) {
  const script = getBurnRedeemScriptForRecipient(recipient, network);
  const btcNetwork = getBtcNetwork(network);
  return btc.Address(btcNetwork).encode({
    type: 'wsh',
    hash: sha256(script),
  });
}
