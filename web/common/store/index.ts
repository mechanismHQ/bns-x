import type { DeploymentNetwork } from '@clarigen/core';
import { contractFactory, OkType, projectFactory } from '@clarigen/core';
import {
  clientState,
  currentAccountAtom,
  networkAtom,
  networkState,
  stxAddressAtom,
} from '@store/micro-stacks';
import { Atom, atom } from 'jotai';
import { atomFamilyWithQuery, atomWithQuery, useQueryAtom } from 'jotai-query-toolkit';
import type { ContractCall } from '@clarigen/core';
import { Response } from '@clarigen/core';
import { fetchAccountBalances } from 'micro-stacks/api';
import { contracts, project } from '../clarigen';
import type {
  AddressBalanceResponse,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import { getContractParts, shiftInt } from '../utils';
import type { ExtractTx } from '../stacks-api';
import {
  convertTypedTx,
  fetchTransaction,
  fetchTypedTransaction,
  ResponseType,
} from '../stacks-api';
import { createAssetInfo } from 'micro-stacks/transactions';
import { ClarigenClient } from '@clarigen/web';
import { atomFamily } from 'jotai/utils';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { getBnsDeployer, getNetworkKey } from '@common/constants';

export const networkKeyAtom = atom<DeploymentNetwork>(() => {
  return getNetworkKey();
});

export const isMainnetState = atom(get => {
  return get(networkKeyAtom) === 'mainnet';
});

export const clarigenAtom = atom(get => {
  const client = get(clientState);

  return new ClarigenClient(client);
  // return WebProvider({ network });
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

export const readOnlyState = atomFamilyWithQuery<ContractCall<any>, any>(
  (get, param) => callToQueryKey(param),
  async (get, param) => {
    const webProvider = get(clarigenAtom);
    return webProvider.ro(param, {
      latest: true,
    });
  }
);

export function useReadOnly<R>(contractCall: ContractCall<R>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return useQueryAtom<R>(readOnlyState(contractCall));
}

export const txReceiptState = atomFamilyWithQuery<
  string | undefined,
  Transaction | MempoolTransaction | null
>(
  (get, txid) => ['fetchTxReceipt', txid],
  async (get, txid) => {
    if (!txid) return null;
    const network = get(networkAtom);
    const tx = await fetchTransaction({
      url: network.getCoreApiUrl(),
      unanchored: true,
      txid,
    });
    return tx;
  }
);

// export const txReceiptStatev2 = atomFamily<string, Atom<Transaction | MempoolTransaction | null>>(
//   (txid: string) => {
//     return atomsWithQuery(get => ({
//       queryKey: ['fetchTxReceipt2', txid],
//       async queryFn() {
//         if (!txid) return null;
//         const network = get(networkAtom);
//         const tx = await fetchTransaction({
//           url: network.getCoreApiUrl(),
//           unanchored: true,
//           txid,
//         });
//         return tx;
//       },
//     }))[0];
//   },
//   Object.is
// );
// export const txReceiptStatev2 = atomsWithQuery<string>((get, txid) => ({
//   queryKey: ['fetchTxReceipt2', txid],
//   async queryFn()
// }))

export const typedTxReceiptState = atomFamilyWithQuery<string, ExtractTx<unknown> | undefined>(
  (get, txid) => ['fetchTypedTxReceipt', txid],
  async (get, txid) => {
    const network = get(networkAtom);
    if (!txid) return Promise.resolve(undefined);
    const tx = await fetchTransaction({
      url: network.getCoreApiUrl(),
      unanchored: true,
      txid,
    });
    return convertTypedTx(tx);
  }
);

export function useTypedTxReceipt<F>(txid: string) {
  return useQueryAtom<ExtractTx<F> | undefined>(typedTxReceiptState(txid));
}

export const pageTitleState = atom(get => {
  const title = get(docTitleState);
  const suffix = title ? `- ${title}` : '';
  return `Dots ${suffix}`;
});

export const docTitleState = atom('');
