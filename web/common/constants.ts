import { DEPLOYMENT_NETWORKS, projectFactory } from '@clarigen/core';
import { ClarigenNodeClient } from '@clarigen/node';
import { project } from '@common/clarigen';
import type { StacksNetwork } from 'micro-stacks/network';
import { StacksMocknet, StacksMainnet, StacksTestnet } from 'micro-stacks/network';

export function getAppUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  throw new Error('Unable to get app URL');
}

export function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url;
  return 'http://localhost:3002';
}

type NetworkKey = typeof DEPLOYMENT_NETWORKS[number];
export function getNetworkKey(): NetworkKey {
  const key = process.env.NEXT_PUBLIC_NETWORK_KEY;
  if (key === 'mocknet') return 'devnet';
  if (typeof key === 'undefined') return 'devnet';
  for (const type of DEPLOYMENT_NETWORKS) {
    if (type === key) return key;
  }
  throw new Error(
    `Invalid SUPPLIER_NETWORK config. Valid values are ${DEPLOYMENT_NETWORKS.join(',')}`
  );
}

export function getNetwork(): StacksNetwork {
  const networkKey = getNetworkKey();
  const upstream = process.env.NEXT_PUBLIC_NODE_URL;
  const netConfig = upstream ? { url: upstream } : undefined;
  switch (networkKey) {
    case 'devnet':
      return new StacksMocknet(netConfig);
    case 'testnet':
      return new StacksTestnet(netConfig);
    case 'mainnet':
      return new StacksMainnet(netConfig);
    default:
      return new StacksMocknet(netConfig);
  }
}

export function getBnsDeployer() {
  if (getNetworkKey() === 'mainnet') {
    return 'SP000000000000000000002Q6VF78';
  }
  return 'ST000000000000000000002AMW42H';
}

export function getClarigenNodeClient() {
  const network = getNetwork();
  return new ClarigenNodeClient(network);
}

export function getContracts() {
  const key = getNetworkKey();
  return projectFactory(project, key as unknown as 'devnet');
}
