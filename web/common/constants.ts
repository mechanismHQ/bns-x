import { BnsContractsClient } from '@bns-x/client';
import { project } from '@bns-x/core';
import { DEPLOYMENT_NETWORKS, projectFactory } from '@clarigen/core';
import { ClarigenNodeClient } from '@clarigen/node';
import type { StacksNetwork } from 'micro-stacks/network';
import { StacksMocknet, StacksMainnet, StacksTestnet } from 'micro-stacks/network';

export function getAppUrl() {
  if (typeof location !== 'undefined') {
    return location.origin;
  }
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
  return 'http://127.0.0.1:3002';
}

type NetworkKey = (typeof DEPLOYMENT_NETWORKS)[number];
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

export function getContractsClient() {
  return new BnsContractsClient(getNetworkKey(), getApiUrl());
}

export function getContracts() {
  return getContractsClient().contracts;
}

export function testUtilsContract() {
  const networkKey = getNetworkKey();
  if (networkKey === 'mainnet') {
    return null;
  }
  return projectFactory(project, networkKey).testUtils;
}

export const ONLY_INSCRIPTIONS = process.env.NEXT_PUBLIC_INSCRIPTIONS === 'true';

export function getTestnetNamespace() {
  if (getNetworkKey() === 'testnet') return 'testable';
  return 'satoshi';
}
