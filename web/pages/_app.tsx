import '../styles/globals.css';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback, useMemo } from 'react';
import { destroySession, saveSession } from '../common/fetchers';
import '../public/fonts.css';
import { JotaiClientProvider } from '@store/micro-stacks';
import { queryClientAtom } from 'jotai-tanstack-query';
import { queryClient } from '@store/query-client';

import type { AppProps } from 'next/app';
import type { ClientConfig } from '@micro-stacks/client';
import { useRouter } from 'next/router';
import { getNetwork, getAppUrl, ONLY_INSCRIPTIONS } from '@common/constants';
import type { Atom } from 'jotai';
import { docTitleState, pageDescriptionState } from '@store/index';
import { prefetchedDisplayNameState } from '@store/api';

export interface PageProps {
  dehydratedState: string;
  displayName?: string;
  stxAddress?: string;
  meta?: {
    title: string;
    description?: string;
  };
}

type AtomPair<T = unknown> = [Atom<T>, T];

function MyApp({ Component, pageProps }: { pageProps?: PageProps } & Omit<AppProps, 'pageProps'>) {
  const router = useRouter();
  const onPersistState: ClientConfig['onPersistState'] = useCallback(
    async (dehydratedState: string) => {
      await saveSession(dehydratedState);
    },
    []
  );

  const onSignOut: ClientConfig['onSignOut'] = useCallback(async () => {
    await destroySession();
    await router.push({ pathname: '/' });
  }, [router]);

  const appUrl = useMemo(() => {
    return getAppUrl();
  }, []);

  const hydratedAtoms: AtomPair[] = [[queryClientAtom, queryClient]];

  if (pageProps?.displayName) {
    const address = pageProps.stxAddress!;
    hydratedAtoms.push([prefetchedDisplayNameState(address), pageProps.displayName]);
  }

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
      onPersistState={onPersistState}
      onSignOut={onSignOut}
      network={getNetwork()}
    >
      <JotaiClientProvider initialValues={hydratedAtoms}>
        <Component {...(pageProps as any)} />
      </JotaiClientProvider>
    </ClientProvider>
  );
}

export default MyApp;
