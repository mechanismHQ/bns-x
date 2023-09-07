import React from 'react';
import { Text } from '@components/ui/text';
import { Button } from '@components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useConnect } from '@common/hooks/use-connect';
import { stxAddressAtom } from '@store/micro-stacks';
import { useAtomValue } from 'jotai';
import type { NextComponentType, NextPageContext } from 'next/types';
import type { AppProps } from 'next/app';
import type { AppCustomProps, PageComponent } from '@pages/_app';
import { Layout } from '@components/layout';

export const LoggedOut: React.FC<{ children?: React.ReactNode }> = () => {
  const { openAuthRequest } = useConnect();
  return (
    <>
      <div className="flex-grow" />
      <div className="max-w-xl mx-auto flex flex-col gap-8 items-center">
        <AlertTriangle className="w-12 h-12 text-dark-warning-icon-warning" />
        <Text variant="Heading03">Log in to continue</Text>
        <Button
          size="lg"
          className="w-64"
          onClick={async () => {
            await openAuthRequest();
          }}
        >
          Log in
        </Button>
      </div>
      <div className="flex-grow" />
    </>
  );
};

export const AuthGuard: React.FC<Pick<AppCustomProps, 'Component' | 'pageProps'>> = ({
  Component,
  pageProps,
}) => {
  const stxAddress = useAtomValue(stxAddressAtom);

  if (!stxAddress) {
    return (
      <Layout centerBox={false}>
        <LoggedOut />
      </Layout>
    );
  }
  return (
    <Component
      {...{
        dehydratedState: null,
        ...pageProps,
      }}
    />
  );
};
