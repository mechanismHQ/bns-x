import { useMicroStacksClient } from '@micro-stacks/react';
import { DeploymentNetwork, ProjectFactory, projectFactory } from '@clarigen/core';
import { project } from '../clarigen';

export function useNetworkKey(): DeploymentNetwork {
  const client = useMicroStacksClient();
  const { network } = client.config;
  if (typeof network === 'string') return network;
  if (typeof network === 'undefined') return 'mainnet';
  if (network.isMainnet()) return 'mainnet';
  if (network.getCoreApiUrl().includes('localhost')) return 'devnet';
  return 'testnet';
}

export function useContracts(): ProjectFactory<typeof project, 'devnet'> {
  const network = useNetworkKey();
  return projectFactory(project, network);
}
