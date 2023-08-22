import 'cross-fetch/polyfill';
import { project, contracts as _contracts } from '@bns-x/core';
import { projectFactory, contractFactory } from '@clarigen/core';
import type { StacksNetwork } from 'micro-stacks/network';
import { StacksMainnet, StacksMocknet, StacksTestnet } from 'micro-stacks/network';
import { privateKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';

export let networkKey: 'devnet' | 'testnet' | 'mainnet' = 'devnet';
export let network: StacksNetwork = new StacksMocknet({
  url: 'http://127.0.0.1:3999',
});
const networkKeyEnv = process.env.NETWORK_KEY;
if (networkKeyEnv === 'testnet') {
  networkKey = 'testnet';
  network = new StacksTestnet();
} else if (networkKeyEnv === 'mainnet') {
  networkKey = 'mainnet';
  network = new StacksMainnet();

  if (typeof process.env.MAINNET === 'undefined') {
    console.error('MAINNET env not included, safe exit.');
    throw 'Safe exit';
  }
}

export const testnetNamespace = networkKey === 'testnet' ? 'testable' : 'satoshi';
export const namespacePrice = networkKey === 'testnet' ? 640000000 : 6400000000;

export const contracts = projectFactory(project, networkKey as unknown as 'devnet');

export const deployer = contracts.bnsxExtensions.identifier.split('.')[0];

export const bns = contractFactory(_contracts.bnsV1, 'ST000000000000000000002AMW42H.bns');

export function getControllerAddress(privateKey: string) {
  const version =
    networkKey === 'mainnet'
      ? StacksNetworkVersion.mainnetP2PKH
      : StacksNetworkVersion.testnetP2PKH;
  if (privateKey.length === 66) {
    const key = privateKey.slice(0, 64);
    const isCompressed = privateKey.slice(64) === '01';
    return privateKeyToStxAddress(key, version, isCompressed);
  }
  return privateKeyToStxAddress(privateKey, version, false);
}
