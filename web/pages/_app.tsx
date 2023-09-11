import '../styles/globals.css';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback, useEffect, useMemo } from 'react';
import { destroySession, saveSession } from '../common/fetchers';
import '../public/fonts.css';
import '../public/nprogress.css';
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
import { AuthGuard } from '@components/logged-out';
import nProgress from 'nprogress';

export interface PageProps {
  dehydratedState: string | null;
  displayName?: string | null;
  stxAddress?: string;
  accountIndex?: number;
  pathAccountIndex?: number;
  meta?: {
    title: string;
    description?: string;
  };
}

type AtomPair<T = unknown> = [Atom<T>, T];

export type PageComponent = AppProps<PageProps>['Component'] & {
  authRequired?: boolean;
};

export type AppCustomProps = { pageProps?: PageProps } & {
  Component: PageComponent;
} & Omit<AppProps, 'pageProps' | 'Component'>;

function MyApp({ Component, pageProps }: AppCustomProps) {
  const router = useRouter();

  const onSignOut: ClientConfig['onSignOut'] = useCallback(async () => {
    await destroySession();
    await router.push({ pathname: '/' });
  }, [router]);

  const appUrl = useMemo(() => {
    return getAppUrl();
  }, []);

  if (pageProps?.stxAddress) {
    queryClient.setQueryData(
      displayNameQueryKey(pageProps.stxAddress),
      pageProps.displayName ?? null
    );
  }

  useEffect(() => {
    router.events.on('routeChangeStart', () => nProgress.start());
    router.events.on('routeChangeComplete', () => nProgress.done());
    router.events.on('routeChangeError', () => nProgress.done());
  }, [router]);

  const hydratedAtoms: AtomPair[] = [[queryClientAtom, queryClient]];

  if (pageProps?.meta) {
    hydratedAtoms.push([docTitleState, pageProps.meta.title]);
    if (pageProps.meta.description) {
      hydratedAtoms.push([pageDescriptionState, pageProps.meta.description]);
    }
  }

  const showAuthGuard = !!(!pageProps?.stxAddress && Component.authRequired);

  return (
    <ClientProvider
      appName={ONLY_INSCRIPTIONS ? 'BNS' : 'Dots'}
      appIconUrl={`${appUrl}/logo.svg`}
      dehydratedState={pageProps?.dehydratedState ?? undefined}
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
              {/* <Component {...pageProps} /> */}
              {showAuthGuard ? (
                <AuthGuard Component={Component} {...pageProps} />
              ) : (
                <Component
                  {...{
                    dehydratedState: null,
                    ...pageProps,
                  }}
                />
              )}
            </AccountProvider>
            <Analytics />
          </JotaiClientProvider>
        </Provider>
      </QueryClientProvider>
    </ClientProvider>
  );
}

export default MyApp;
