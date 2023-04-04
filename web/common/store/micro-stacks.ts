import type React from 'react';
import { createElement, useCallback, useMemo } from 'react';
import type { Atom } from 'jotai';
import { atom, Provider, useAtomValue } from 'jotai';
import { useMicroStacksClient } from '@micro-stacks/react';
import {
  watchAccounts,
  watchCurrentAccount,
  watchStatus,
  watchNetwork,
  watchIdentityAddress,
  watchDecentralizedID,
  getAccounts,
  getCurrentAccount,
  getStatus,
  getNetwork,
  getIdentityAddress,
  getDecentralizedID,
  watchStxAddress,
  getStxAddress,
  TxType,
  StatusKeys,
  Status,
  getAppDetails,
  watchAppDetails,
  getClient,
} from '@micro-stacks/client';
import { ChainID, hexToBytes } from 'micro-stacks/common';

import type {
  State,
  MicroStacksClient,
  ContractCallParams,
  ContractDeployParams,
  StxTransferParams,
  Account as MicroStackAccount,
} from '@micro-stacks/client';
import type { PropsWithChildren } from 'react';
import type { SignedOptionsWithOnHandlers } from 'micro-stacks/connect';
import type { ClarityValue } from 'micro-stacks/clarity';
import type { Mutate, StoreApi } from 'zustand/vanilla';
import { c32address, StacksNetworkVersion } from 'micro-stacks/crypto';
import type { StacksNetwork } from 'micro-stacks/network';
import isEqual from 'lodash-es/isEqual';
import { useHydrateAtoms } from 'jotai/utils';

/** ------------------------------------------------------------------------------------------------------------------
 *   Client
 *  ------------------------------------------------------------------------------------------------------------------
 */

const NO_CLIENT_MESSAGE =
  'No client set in jotai context, wrap your app in JotaiClientProvider to set one';

export const clientAtom = atom<MicroStacksClient | null>(null);
export const clientState = atom<MicroStacksClient>(get => {
  const client = get(clientAtom);
  if (!client) throw new Error(NO_CLIENT_MESSAGE);
  return client;
});

/** ------------------------------------------------------------------------------------------------------------------
 *   Jotai provider (for setting client context)
 *  ------------------------------------------------------------------------------------------------------------------
 */

// export const JotaiClientProvider2: React.FC<{
//   initialValues?: [Atom<unknown>, unknown][];
//   children: React.ReactNode;
// }> = ({ children, initialValues }) => {
//   const client = useMicroStacksClient();
//   useHydrateAtoms([[clientAtom, client] as const, ...(initialValues || [])]);

//   return <>{children}</>;
// };

// this goes below `ClientProvider` in your app
export const JotaiClientProvider: React.FC<
  PropsWithChildren<{ initialValues?: [Atom<unknown>, unknown][] }>
> = ({ children, initialValues }) => {
  const client = useMicroStacksClient();

  const props = useMemo(
    () => ({
      initialValues: [[clientAtom, client] as const, ...(initialValues || [])],
    }),
    [client, initialValues]
  );

  return createElement(Provider, props, children);
};

/** ------------------------------------------------------------------------------------------------------------------
 *   Atom factory (helper function)
 *  ------------------------------------------------------------------------------------------------------------------
 */

type SubscriptionFn<V> = (setter: (value: V) => void, client: MicroStacksClient) => () => void;
type GetterFn<V> = (options: { client: MicroStacksClient; state?: State }) => V;

function atomWithMicroStacks<V>(getter: GetterFn<V>, subscribe: SubscriptionFn<V>) {
  return atom<V>(get => {
    const client = get(clientState);
    const valueAtom = atom<V>(getter({ client }));
    const subscriberAtom = atom<V, V>(
      get => {
        return get(valueAtom);
      },
      (_get, set, action) => {
        set(valueAtom, action);
      }
    );
    subscriberAtom.onMount = setAtom => {
      const unsubscribe = subscribe(setAtom, client);
      return () => {
        unsubscribe();
      };
    };
    return get(subscriberAtom);
  });
}

/** ------------------------------------------------------------------------------------------------------------------
 *  Subscribed values
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const stxAddressAtom = atomWithMicroStacks(getStxAddress, watchStxAddress);
export const accountsAtom = atomWithMicroStacks(getAccounts, watchAccounts);
export const currentAccountInnterAtom = atomWithMicroStacks(getCurrentAccount, watchCurrentAccount);
export const identityAddressAtom = atomWithMicroStacks(getIdentityAddress, watchIdentityAddress);
export const networkAtom = atomWithMicroStacks(getNetwork, watchNetwork);
export const statusAtom = atomWithMicroStacks(getStatus, watchStatus);
export const decentralizedIDAtom = atomWithMicroStacks(getDecentralizedID, watchDecentralizedID);
export const appDetailsAtom = atomWithMicroStacks(getAppDetails, watchAppDetails);

export const useStxAddressValue = () => useAtomValue(stxAddressAtom);
export const useAccountsValue = () => useAtomValue(accountsAtom);
export const useCurrentAccountValue = () => useAtomValue(currentAccountInnterAtom);
export const useIdentityAddressValue = () => useAtomValue(identityAddressAtom);
export const useNetworkValue = () => useAtomValue(networkAtom);
export const useStatusValue = () => useAtomValue(statusAtom);
export const useDecentralizedIDValue = () => useAtomValue(decentralizedIDAtom);
export const useAppDetails = () => useAtomValue(appDetailsAtom);

export const currentAccountAtom = atom<Account | undefined>(get => {
  const account = get(currentAccountInnterAtom);
  const address = get(stxAddressAtom);
  if (typeof account === 'undefined') return undefined;
  return {
    ...account,
    stxAddress: address!,
  };
});

export type Account = MicroStackAccount & {
  stxAddress: string;
};

function selectAccounts(accounts: MicroStackAccount[], network: StacksNetwork): Account[] {
  return accounts.map(account => ({
    stxAddress: c32address(
      network.isMainnet() ? account.address[0] : StacksNetworkVersion.testnetP2PKH,
      hexToBytes(account.address[1])
    ),
    ...account,
  }));
}

// return de-duped accounts
export function getCleanAccounts(options: { client: MicroStacksClient; state?: State }): Account[] {
  const { client, state } = options;
  const accounts = state?.accounts || client.getState().accounts;
  const network = state?.network || client.getState().network;

  const clean: Account[] = [];

  accounts.forEach((account: MicroStackAccount) => {
    const exists = clean.find(a => a.address[1] === account.address[1]);
    if (exists) return;
    clean.push({
      stxAddress: c32address(
        network.isMainnet() ? account.address[0] : StacksNetworkVersion.testnetP2PKH,
        hexToBytes(account.address[1])
      ),
      ...account,
    });
  });
  return clean;
}

export const cleanAccountsAtom = atomWithMicroStacks<Account[]>(
  getCleanAccounts,
  (callback: (payload: Account[]) => void, client: MicroStacksClient = getClient()) =>
    client.subscribe((state: State) => selectAccounts(state.accounts, state.network), callback, {
      equalityFn: isEqual,
    })
);

/** ------------------------------------------------------------------------------------------------------------------
 *  Authentication (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const authState = atom(get => {
  const client = get(clientState);
  const stxAddress = get(stxAddressAtom);
  const status = get(statusAtom);
  return {
    /**
     * actions
     */
    openAuthRequest: client.authenticate,
    signOut: client.signOut,
    /**
     * state
     */
    isSignedIn: !!stxAddress,
    isRequestPending: status[StatusKeys.Authentication] === Status.IsLoading,
  };
});

export const useAuthState = () => useAtomValue(authState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Account (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const accountState = atom(get => {
  const account = get(currentAccountAtom);
  return {
    appPrivateKey: account?.appPrivateKey ?? null,
    rawAddress: account?.address ?? null,
    identityAddress: get(identityAddressAtom),
    decentralizedID: get(decentralizedIDAtom),
    stxAddress: get(stxAddressAtom),
    profileUrl: account?.profile_url ?? null,
  };
});

export const useAccountState = () => useAtomValue(accountState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Network (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const networkState = atom(get => {
  const client = get(clientState);
  const network = get(networkAtom);

  network.isMainnet = () => network.chainId === ChainID.Mainnet;

  const isMainnet = network.isMainnet();
  return {
    /**
     * actions
     */
    setNetwork: client.setNetwork,
    /**
     * state
     */
    network,
    isMainnet,
  };
});

export const useNetworkState = () => useAtomValue(networkState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract call (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openContractCallState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openContractCall = (params: ContractCallParams) =>
      client.signTransaction(TxType.ContractCall, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openContractCall,
    isRequestPending,
  };
});

export const useOpenContractCallState = () => useAtomValue(openContractCallState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Contract deploy (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */
export const openContractDeployState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openContractDeploy = (params: ContractDeployParams) =>
      client.signTransaction(TxType.ContractDeploy, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openContractDeploy,
    isRequestPending,
  };
});

export const useOpenContractDeployState = () => useAtomValue(openContractDeployState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Stx token transfer (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openStxTokenTransferState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openStxTokenTransfer = (params: StxTransferParams) =>
      client.signTransaction(TxType.TokenTransfer, {
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.TransactionSigning] === Status.IsLoading;

  return {
    openStxTokenTransfer,
    isRequestPending,
  };
});

export const useOpenStxTokenTransferState = () => useAtomValue(openStxTokenTransferState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openSignMessageState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openSignMessage = (params: SignedOptionsWithOnHandlers<{ message: string }>) =>
      client.signMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.MessageSigning] === Status.IsLoading;

  return {
    openSignMessage,
    isRequestPending,
  };
});

export const useOpenSignMessageState = () => useAtomValue(openSignMessageState);

/** ------------------------------------------------------------------------------------------------------------------
 *  Sign structured message (derived state)
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const openSignStructuredMessageState = atom(get => {
  const client = get(clientState);
  const status = get(statusAtom);

  const openSignStructuredMessage = (
      params: SignedOptionsWithOnHandlers<{
        message: string | ClarityValue;
        domain?: {
          name?: string;
          version?: string;
          chainId?: ChainID;
        };
      }>
    ) =>
      client.signStructuredMessage({
        ...params,
        onFinish: payload => {
          params?.onFinish?.(payload);
        },
        onCancel: error => {
          params?.onCancel?.(error);
        },
      }),
    isRequestPending = status[StatusKeys.StructuredMessageSigning] === Status.IsLoading;

  return {
    openSignStructuredMessage,
    isRequestPending,
  };
});

export const useOpenSignStructuredMessageState = () => useAtomValue(openSignStructuredMessageState);

/** ------------------------------------------------------------------------------------------------------------------
 */

export const currentAccountIndexOverrideAtom = atom<number | null>(null);

// export const currentAccountOverrideAtom = atom(get => {
//   const state = get(clientState);
//   const { accounts, currentAccountIndex } = state.getState();
//   const indexOverride = get(currentAccountIndexOverrideAtom);
//   if (indexOverride !== null) {
//     return accounts[indexOverride];
//   }
//   return accounts.at(-1);
// });

export const microStacksStoreAtom = atom(get => {
  const client = get(clientState);
  const store = client.store as StoreApi<State>;
  return store;
});

export function findAccountIndexForAddress({
  address,
  accounts,
  network,
}: {
  address: string;
  accounts: MicroStackAccount[];
  network: StacksNetwork;
}): { index: number; stxAddress: string } | undefined {
  for (let i = 0; i < accounts.length; i++) {
    const a = accounts[i];
    const _address = c32address(
      network.isMainnet() ? StacksNetworkVersion.mainnetP2PKH : StacksNetworkVersion.testnetP2PKH,
      hexToBytes(a!.address[1])
    );
    if (address === _address) {
      return {
        index: i,
        stxAddress: _address,
      };
    }
  }
}
