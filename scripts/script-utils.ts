import 'cross-fetch/polyfill';
import { project, contracts as _contracts } from '../indexer/src/client/clarigen';
import { projectFactory, contractFactory } from '@clarigen/core';
import type { StacksNetwork } from 'micro-stacks/network';
import { StacksMainnet, StacksMocknet, StacksTestnet } from 'micro-stacks/network';

export let networkKey: 'devnet' | 'testnet' | 'mainnet' = 'devnet';
export let network: StacksNetwork = new StacksMocknet();
const networkKeyEnv = process.env.NETWORK_KEY;
if (networkKeyEnv === 'testnet') {
  networkKey = 'testnet';
  network = new StacksTestnet();
} else if (networkKeyEnv === 'mainnet') {
  networkKey = 'mainnet';
  network = new StacksMainnet();
}

export const contracts = projectFactory(project, networkKey as unknown as 'devnet');

export const bns = contractFactory(_contracts.bnsV1, 'ST000000000000000000002AMW42H.bns');
