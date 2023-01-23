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
import { getNetwork, getAppUrl } from '@common/constants';

function MyApp({ Component, pageProps }: AppProps) {
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
  }, []);

  const appUrl = useMemo(() => {
    return getAppUrl();
  }, []);

  return (
    <ClientProvider
      appName="Dots"
      appIconUrl={`${appUrl}/logo.svg`}
      dehydratedState={pageProps?.dehydratedState}
      onPersistState={onPersistState}
      onSignOut={onSignOut}
      network={getNetwork()}
    >
      <JotaiClientProvider initialValues={[[queryClientAtom, queryClient]]}>
        <Component {...pageProps} />
      </JotaiClientProvider>
    </ClientProvider>
  );
}

export default MyApp;
