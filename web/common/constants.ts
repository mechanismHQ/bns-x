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
