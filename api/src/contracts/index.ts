import { project, contracts } from '@bns-x/core';
import { projectFactory } from '@clarigen/core';
import { ClarigenNodeClient } from '@clarigen/node';
import { getNetwork, getNetworkKey } from '../constants';
import { getContractParts } from '~/utils';

export function getContracts() {
  return projectFactory(project, getNetworkKey() as unknown as 'devnet');
}

export function isMainnet() {
  return getNetworkKey() === 'mainnet';
}

export function queryHelperContract() {
  return getContracts().queryHelper;
}

export function registryContract() {
  return getContracts().bnsxRegistry;
}

export function registryContractAsset() {
  const contract = registryContract();
  const nft = contract.non_fungible_tokens[0].name;
  return `${contract.identifier}::${nft}`;
}

export function getBnsDeployer(mainnet = true) {
  if (mainnet) {
    return 'SP000000000000000000002Q6VF78';
  }
  return 'ST000000000000000000002AMW42H';
}

export function bnsContractAsset() {
  const bns = contracts.bnsV1;
  const asset = bns.non_fungible_tokens[0].name;
  return `${getBnsDeployer(isMainnet())}.bns::${asset}`;
}

export function clarigenProvider() {
  const network = getNetwork();
  const clarigen = new ClarigenNodeClient(network);
  return clarigen;
}

export function getDeployer() {
  const registryId = registryContract().identifier;
  return getContractParts(registryId)[0];
}
