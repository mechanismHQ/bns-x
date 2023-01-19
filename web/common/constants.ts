import { projectFactory } from '@clarigen/core';
import { ClarigenNodeClient } from '@clarigen/node';
import { project } from '@common/clarigen';
import { StacksMocknet } from 'micro-stacks/network';

export function getAppUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  throw new Error('Unable to get app URL');
}

export function getNetwork() {
  const nodeUrl = process.env.NEXT_PUBLIC_NODE_URL;
  const network = new StacksMocknet({ url: nodeUrl });

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
