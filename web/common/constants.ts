import { projectFactory } from '@clarigen/core';
import { ClarigenNodeClient } from '@clarigen/node';
import { project } from '@common/clarigen';
import { StacksMocknet, NetworkConfig } from 'micro-stacks/network';

export function getAppUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  throw new Error('Unable to get app URL');
}

export function getNetwork() {
  // let networkConfig: NetworkConfig | undefined = undefined;
  const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL;
  const netConfig = nodeUrl ? { url: nodeUrl } : undefined;
  const network = new StacksMocknet(netConfig);

  // if (process.env.NEXT_PUBLIC_NODE_URL) {
  //   network.coreApiUrl = process.env.NEXT_PUBLIC_NODE_URL;
  // }

  return network;
}

export function getClarigenNodeClient() {
  const network = getNetwork();
  return ClarigenNodeClient({ network });
}

export function getContracts() {
  return projectFactory(project, 'devnet');
}
