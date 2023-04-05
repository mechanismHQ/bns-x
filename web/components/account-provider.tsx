import React from 'react';
import {
  microStacksStoreAtom,
  networkAtom,
  overridePrimaryAccountIndexAtom,
  stxAddressAtom,
} from '@store/micro-stacks';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useMicroStacksClient } from '@micro-stacks/react';
import { destroySession, saveSession } from '@common/fetchers';
import { createStacksAddress } from '@common/utils';

export const AccountProvider: React.FC<{
  children?: React.ReactNode;
  primaryIndex?: number;
  pathAccountIndex?: number;
}> = ({ children, primaryIndex, pathAccountIndex }) => {
  const router = useRouter();
  const stxAddress = useAtomValue(stxAddressAtom);
  const client = useMicroStacksClient();

  const onSignOut = useAtomCallback(
    useCallback(
      async (get, set) => {
        set(overridePrimaryAccountIndexAtom, undefined);
        await destroySession();
        await router.push({ pathname: '/' });
      },
      [router]
    )
  );

  const onPersistState = useAtomCallback(
    useCallback(async (get, _set, dehydratedState: string) => {
      const overridePrimaryIndex = get(overridePrimaryAccountIndexAtom);
      await saveSession(dehydratedState, overridePrimaryIndex);
    }, [])
  );

  useEffect(() => {
    client.setOnSignOut(() => void onSignOut());
    client.setOnPersistState(onPersistState);
    () => {
      client.setOnSignOut(undefined);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      client.setOnPersistState(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAccount = useAtomCallback(
    useCallback((get, set, address: string) => {
      const store = get(microStacksStoreAtom);
      const network = get(networkAtom);

      store.setState(({ accounts }) => {
        const accountIndex = accounts?.findIndex(a => {
          const _address = createStacksAddress({ address: a.address, network });
          return address === _address;
        });

        if (accountIndex === -1) {
          return {};
        }

        console.log(`Setting account index ${accountIndex} for address ${address}`);

        return {
          currentAccountIndex: accountIndex,
        };
      });
    }, [])
  );

  const resetFromSSR = useAtomCallback(
    useCallback(
      get => {
        const store = get(microStacksStoreAtom);
        const storeIndex = store.getState().currentAccountIndex;
        if (typeof pathAccountIndex !== 'undefined') {
          if (pathAccountIndex !== storeIndex) {
            console.log('Setting index to path-based account', pathAccountIndex);
            store.setState({ currentAccountIndex: pathAccountIndex });
          }
        } else if (typeof primaryIndex !== 'undefined' && primaryIndex !== storeIndex) {
          console.log('Resetting index to primary', primaryIndex);
          store.setState({ currentAccountIndex: primaryIndex });
        }
      },
      [primaryIndex, pathAccountIndex]
    )
  );

  useEffect(() => {
    void resetFromSSR();
  }, [resetFromSSR]);

  useEffect(() => {
    console.log(`Account set to ${stxAddress ?? 'none'}`);
  }, [stxAddress]);

  useEffect(() => {
    const setAccountFromRoute = (url: string) => {
      if (url.startsWith('/accounts/')) {
        const address = url.split('/')[2];
        if (!address) return;
        void setAccount(address);
      } else {
        void resetFromSSR();
      }
    };

    setAccountFromRoute(router.pathname);

    router.events.on('routeChangeStart', setAccountFromRoute);

    return () => {
      router.events.off('routeChangeStart', setAccountFromRoute);
    };
  }, [router, setAccount, resetFromSSR]);

  return <>{children}</>;
};
