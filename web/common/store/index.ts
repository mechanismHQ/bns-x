import { contractFactory, DeploymentNetwork, OkType, projectFactory } from '@clarigen/core';
import { WebProvider } from '@clarigen/web';
import {
  clientState,
  currentAccountAtom,
  networkAtom,
  networkState,
  stxAddressAtom,
} from '@micro-stacks/jotai';
import { Atom, atom } from 'jotai';
import { StacksMocknet } from 'micro-stacks/network';
import { atomFamilyWithQuery, atomWithQuery, useQueryAtom } from 'jotai-query-toolkit';
import { ContractCall, Response } from '@clarigen/core';
import { fetchAccountBalances } from 'micro-stacks/api';
import { contracts, project } from '../clarigen';
import {
  AddressBalanceResponse,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import { shiftInt } from '../utils';
import {
  convertTypedTx,
  ExtractTx,
  fetchTransaction,
  fetchTypedTransaction,
  ResponseType,
} from '../stacks-api';
import { createAssetInfo } from 'micro-stacks/transactions';
import { ClarigenClient } from '@clarigen/web';
import { atomFamily } from 'jotai/utils';
import { atomsWithQuery } from 'jotai-tanstack-query';

export const networkKeyAtom = atom<DeploymentNetwork>(get => {
  const network = get(networkAtom);
  if (network.isMainnet()) return 'mainnet';
  if (network instanceof StacksMocknet) return 'devnet';
  return 'testnet';
});

export const clarigenAtom = atom(get => {
  const network = get(networkAtom);
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
  return ensure(get(contractsState).nameRegistry);
});

export const registryAssetState = atom(get => {
  const registry = get(nameRegistryState);
  const contractId = registry.identifier;
  const asset = registry.non_fungible_tokens[0].name;
  return `${contractId}::${asset}`;
});

export const bnsContractState = atom(get => {
  const bns = contracts.bnsV1;
  return contractFactory(bns, 'ST000000000000000000002AMW42H.bns');
});

export const tokenAssetInfoState = atom(get => {
  const token = get(nameRegistryState);
  const [addr, name] = token.identifier.split('.');
  const asset = token.non_fungible_tokens[0].name;
  return createAssetInfo(addr, name, asset);
});

export const bnsAssetInfoState = atom(get => {
  const bns = get(bnsContractState);
  const [addr, name] = bns.identifier.split('.');
  const asset = bns.non_fungible_tokens[0].name;
  return createAssetInfo(addr, name, asset);
});

function callToQueryKey(contractCall: ContractCall<any>) {
  return [
    contractCall.contractAddress,
    contractCall.function.name,
    ...contractCall.nativeArgs.map(a => `${a}`),
  ];
}

export const readOnlyState = atomFamilyWithQuery<ContractCall<any>, any>(
  (get, param) => callToQueryKey(param),
  async (get, param) => {
    const webProvider = get(clarigenAtom);
    const network = get(networkAtom);
    return webProvider.ro(param, {
      latest: true,
    });
  }
);

export function useReadOnly<R>(contractCall: ContractCall<R>) {
  return useQueryAtom<R>(readOnlyState(contractCall));
}

// export const addressBalanceStatev2 = atomsWithQuery((get) => ({
//   queryKey:
// }))

// type AddressBalanceResponse = ReturnType<typeof fetchAccountBalances>;
export const addressBalanceState = atomFamilyWithQuery<string, AddressBalanceResponse | undefined>(
  (get, address) => ['stxAddressBalances', address],
  async (get, address) => {
    const network = get(networkAtom);
    const balances = (await fetchAccountBalances({
      url: network.getCoreApiUrl(),
      unanchored: true,
      principal: address,
    })) as AddressBalanceResponse;

    return balances;
  }
);

export const userBalancesQueryAtom = atom<AddressBalanceResponse | undefined>(get => {
  const address = get(stxAddressAtom);
  if (typeof address === 'undefined') return undefined;
  const balance = get(addressBalanceState(address));
  return balance;
});

export const userBalancesState = atom(get => {
  const balances = get(userBalancesQueryAtom);
  let stx = '0';
  let token = '0';
  if (typeof balances !== 'undefined') {
    stx = balances.stx.balance;
    const tokenContract = get(nameRegistryState);
    const id = `${tokenContract.identifier}::${tokenContract.non_fungible_tokens[0].name}`;
    token = balances.fungible_tokens[id]?.balance || '0';
  }
  return {
    stx,
    token,
  };
});

export const userFormattedBalancesState = atom(get => {
  const { stx, token } = get(userBalancesState);
  return {
    stx: shiftInt(stx, -6).toFormat(),
    token: shiftInt(token, -8).toFormat(),
  };
});

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
