import { DEPLOYMENT_NETWORKS } from '@clarigen/core';
import type { StacksNetwork } from 'micro-stacks/network';
import { StacksMainnet, StacksMocknet, StacksTestnet } from 'micro-stacks/network';

type NetworkKey = (typeof DEPLOYMENT_NETWORKS)[number];
export function getNetworkKey(): NetworkKey {
  const key = process.env.NETWORK_KEY;
  if (key === 'mocknet') return 'devnet';
  if (typeof key === 'undefined') return 'devnet';
  for (const type of DEPLOYMENT_NETWORKS) {
    if (type === key) return key;
  }
  throw new Error(`Invalid NETWORK_KEY config. Valid values are ${DEPLOYMENT_NETWORKS.join(',')}`);
}

export function getNetwork(): StacksNetwork {
  const networkKey = getNetworkKey();
  const upstream = process.env.STACKS_API_UPSTREAM;
  const netConfig = upstream ? { url: upstream } : undefined;
  switch (networkKey) {
    case 'devnet':
      return new StacksMocknet({
        url: 'http://127.0.0.1:3999',
      });
    case 'testnet':
      return new StacksTestnet(netConfig);
    case 'mainnet':
      return new StacksMainnet(netConfig);
    default:
      return new StacksMocknet(netConfig);
  }
}

export function getNodeUrl() {
  return getNetwork().getCoreApiUrl();
}
