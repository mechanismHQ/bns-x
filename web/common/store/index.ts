import type { DeploymentNetwork } from '@clarigen/core';
import { contractFactory, projectFactory } from '@clarigen/core';
import { clientState, networkAtom } from '@store/micro-stacks';
import { atom, useAtomValue } from 'jotai';
import type { ContractCall } from '@clarigen/core';
import { contracts, project } from '../clarigen';
import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import { getContractParts, shiftInt } from '../utils';
import { fetchTransaction } from '../stacks-api';
import { createAssetInfo } from 'micro-stacks/transactions';
import { ClarigenClient } from '@clarigen/web';
import { atomFamily } from 'jotai/utils';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { getBnsDeployer, getNetworkKey } from '@common/constants';
import isEqual from 'lodash-es/isEqual';

export const networkKeyAtom = atom<DeploymentNetwork>(() => {
  return getNetworkKey();
});

export const isMainnetState = atom(get => {
  return get(networkKeyAtom) === 'mainnet';
});

export const clarigenAtom = atom(get => {
  const client = get(clientState);

  return new ClarigenClient(client);
});

export const contractsState = atom(get => {
  const networkKey = get(networkKeyAtom);
  return projectFactory(project, networkKey as unknown as 'devnet');
});

function ensure<T>(contract: T): T {
  if (typeof contract === 'undefined') {
    throw new Error('Unable to use contract - no deployer');
  }
  return contract;
}

export const nameRegistryState = atom(get => {
  return ensure(get(contractsState).bnsxRegistry);
});

export const registryAssetState = atom(get => {
  const registry = get(nameRegistryState);
  const contractId = registry.identifier;
  const asset = registry.non_fungible_tokens[0].name;
  return `${contractId}::${asset}`;
});

// todo: fix for mainnet
export const bnsContractState = atom(() => {
  const bns = contracts.bnsV1;
  return contractFactory(bns, `${getBnsDeployer()}.bns`);
});

export const tokenAssetInfoState = atom(get => {
  const token = get(nameRegistryState);
  const [addr, name] = getContractParts(token.identifier);
  const asset = token.non_fungible_tokens[0].name;
  return createAssetInfo(addr, name, asset);
});

export const bnsAssetInfoState = atom(get => {
  const bns = get(bnsContractState);
  const [addr, name] = getContractParts(bns.identifier);
  const asset = bns.non_fungible_tokens[0].name;
  return createAssetInfo(addr, name, asset);
});

function callToQueryKey(contractCall: ContractCall<any>) {
  return [
    contractCall.contractAddress,
    contractCall.function.name,
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    ...contractCall.nativeArgs.map(a => `${a}`),
  ];
}

export const readOnlyState = atomFamily(
  (contractCall: ContractCall<any>) => {
    return atomsWithQuery(get => ({
      queryKey: callToQueryKey(contractCall),
      async queryFn() {
        const webProvider = get(clarigenAtom);
        return webProvider.ro(contractCall, {
          latest: true,
        });
      },
    }))[0];
  },
  (a, b) => {
    const aKey = callToQueryKey(a);
    const bKey = callToQueryKey(b);
    return isEqual(aKey, bKey);
  }
);

export function useReadOnly<R>(contractCall: ContractCall<R>) {
  return useAtomValue<R>(readOnlyState(contractCall));
}

export const txReceiptState = atomFamily((txid: string | undefined) => {
  return atomsWithQuery<Transaction | MempoolTransaction | null>(get => ({
    queryKey: ['fetchTxReceipt', txid],
    async queryFn() {
      if (!txid) return null;
      const network = get(networkAtom);
      const tx = await fetchTransaction({
        url: network.getCoreApiUrl(),
        unanchored: true,
        txid,
      });
      return tx;
    },
  }))[0];
}, isEqual);

export const pageTitleState = atom(get => {
  const title = get(docTitleState);
  const suffix = title ? `- ${title}` : '';
  return `Dots ${suffix}`;
});

export const docTitleState = atom('');
