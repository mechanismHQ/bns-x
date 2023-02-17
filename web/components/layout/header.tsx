import React, { Suspense } from 'react';
import { SpaceBetween, Stack } from '@nelson-ui/react';
import { useAtomValue } from 'jotai';
import { useIsSSR } from '../../common/hooks/use-is-ssr';
import { stxAddressAtom } from '@store/micro-stacks';
import { WalletConnectButton } from '../wallet-connect-button';
import { LogoIcon } from '@components/icons/logo';
import { useRouter } from 'next/router';
import { Menu } from '@components/layout/menu';

export const TokenBalance: React.FC = () => {
  const stxAddress = useAtomValue(stxAddressAtom);

  if (!stxAddress) {
    return <WalletConnectButton />;
  }

  return <Menu />;
};

export const Header: React.FC<{ children?: React.ReactNode }> = () => {
  const isSSR = useIsSSR();
  const router = useRouter();

  return (
    <SpaceBetween
      spacing="30px"
      width="100%"
      py="25px"
      px="29px"
      // height="50px"
      maxWidth="1120px"
      alignItems={'center'}
    >
      <LogoIcon
        cursor="pointer"
        size="32px"
        onClick={async () => {
          await router.push({ pathname: '/' });
        }}
      />
      <Stack isInline spacing="8px">
        {isSSR ? null : (
          <Suspense fallback={<></>}>
            <TokenBalance />
          </Suspense>
        )}
      </Stack>
    </SpaceBetween>
  );
};
