import '../styles/globals.css';
import { ClientProvider } from '@micro-stacks/react';
import { useCallback } from 'react';
import { destroySession, saveSession } from '../common/fetchers';
import '../public/fonts.css';
import { JotaiClientProvider } from '@micro-stacks/jotai';

import type { AppProps } from 'next/app';
import type { ClientConfig } from '@micro-stacks/client';
import { useRouter } from 'next/router';
import { getNetwork } from '@common/constants';

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

  return (
    <ClientProvider
      appName="Dots"
      appIconUrl="/vercel.png"
      dehydratedState={pageProps?.dehydratedState}
      onPersistState={onPersistState}
      onSignOut={onSignOut}
      network={getNetwork()}
    >
      <JotaiClientProvider>
        <Component {...pageProps} />
      </JotaiClientProvider>
    </ClientProvider>
  );
}

export default MyApp;
