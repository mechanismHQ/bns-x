import '../styles/globals.css';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback, useMemo } from 'react';
import { destroySession, saveSession } from '../common/fetchers';
import '../public/fonts.css';
import { JotaiClientProvider } from '@components/jotai-provider';
import { queryClientAtom } from 'jotai-tanstack-query';
import { queryClient } from '@store/query-client';

import type { AppProps } from 'next/app';
import type { ClientConfig } from '@micro-stacks/client';
import { useRouter } from 'next/router';
import { getNetwork, getAppUrl, ONLY_INSCRIPTIONS } from '@common/constants';
import type { Atom } from 'jotai';
import { Provider } from 'jotai';
import { docTitleState, pageDescriptionState } from '@store/index';
import { displayNameQueryKey, prefetchedDisplayNameState } from '@store/api';
import { Analytics } from '@vercel/analytics/react';
import { AccountProvider } from '@components/account-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export interface PageProps {
  dehydratedState: string;
  displayName?: string;
  stxAddress?: string;
  accountIndex?: number;
  pathAccountIndex?: number;
  meta?: {
    title: string;
    description?: string;
  };
}

type AtomPair<T = unknown> = [Atom<T>, T];

function MyApp({ Component, pageProps }: { pageProps?: PageProps } & Omit<AppProps, 'pageProps'>) {
  const router = useRouter();
  // const onPersistState: ClientConfig['onPersistState'] = useCallback(
  //   async (dehydratedState: string) => {
  //     await saveSession(dehydratedState);
  //   },
  //   []
  // );

  const onSignOut: ClientConfig['onSignOut'] = useCallback(async () => {
    await destroySession();
    await router.push({ pathname: '/' });
  }, [router]);

  const appUrl = useMemo(() => {
    return getAppUrl();
  }, []);

  if (pageProps?.stxAddress) {
    queryClient.setQueryData(displayNameQueryKey(pageProps.stxAddress), pageProps.displayName);
  }

  const hydratedAtoms: AtomPair[] = [[queryClientAtom, queryClient]];

  if (pageProps?.meta) {
    hydratedAtoms.push([docTitleState, pageProps.meta.title]);
    if (pageProps.meta.description) {
      hydratedAtoms.push([pageDescriptionState, pageProps.meta.description]);
    }
  }

  return (
    <ClientProvider
      appName={ONLY_INSCRIPTIONS ? 'BNS' : 'Dots'}
      appIconUrl={`${appUrl}/logo.svg`}
      dehydratedState={pageProps?.dehydratedState}
      // onPersistState={onPersistState}
      onSignOut={onSignOut}
      network={getNetwork()}
    >
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
        <Provider>
          <JotaiClientProvider initialValues={hydratedAtoms}>
            <AccountProvider
              primaryIndex={pageProps?.accountIndex}
              pathAccountIndex={pageProps?.pathAccountIndex}
            >
              <Component {...(pageProps as any)} />
            </AccountProvider>
            <Analytics />
          </JotaiClientProvider>
        </Provider>
      </QueryClientProvider>
    </ClientProvider>
  );
}

export default MyApp;
