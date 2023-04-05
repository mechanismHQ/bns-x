import { useCallback } from 'react';
import { authenticate } from 'micro-stacks/connect';
import { useAtomCallback } from 'jotai/utils';
import { useAtomValue } from 'jotai';
import {
  accountsAtom,
  appDetailsAtom,
  clientState,
  microStacksStoreAtom,
  networkAtom,
  statusAtom,
} from '@store/micro-stacks';
import { c32addressDecode } from 'micro-stacks/crypto';
import { bytesToHex } from 'micro-stacks/common';
import { Status, StatusKeys } from '@micro-stacks/client';
import { createStacksAddress } from '@common/utils';

type OnFinish = (address: string) => void | Promise<void>;

export function useAddAccount() {
  const status = useAtomValue(statusAtom);

  const addAccount = useAtomCallback(
    useCallback(async (get, _set, cb?: OnFinish) => {
      const appDetails = get(appDetailsAtom);
      if (!appDetails || !appDetails.name || !appDetails.icon) {
        throw new Error('Invalid - app details not set.');
      }
      const { name, icon } = appDetails;
      const accounts = get(accountsAtom);
      const store = get(microStacksStoreAtom);
      const client = get(clientState);
      const network = get(networkAtom);
      client.setIsRequestPending(StatusKeys.Authentication);
      await authenticate({
        appDetails: {
          name,
          icon,
        },
        onFinish: async session => {
          const [version, bytes] = c32addressDecode(session.addresses.mainnet);

          const address: [number, string] = [version, bytesToHex(bytes)];
          const stxAddress = createStacksAddress({ address, network });

          const hasAccount = accounts.find(account => account.address[1] === address[1]);
          // if this is not currently saved, we should save it
          if (!hasAccount) {
            store.setState(state => ({
              ...state,
              accounts: state.accounts.concat({
                address,
                appPrivateKey: session.appPrivateKey,
                decentralizedID: session.decentralizedID,
                profile_url: session.profile_url,
              }),
              // currentAccountIndex: state.accounts.length,
            }));
          } else {
            // else just switch to the index
            store.setState(s => ({
              ...s,
              // currentAccountIndex: accounts.findIndex(account => account.address === address),
            }));
          }
          await client.persist();
          client.setIsIdle(StatusKeys.Authentication);
          await cb?.(stxAddress);
        },
      });
    }, [])
  );

  return {
    addAccount,
    isRequestPending: status[StatusKeys.Authentication] === Status.IsLoading,
  };
}
