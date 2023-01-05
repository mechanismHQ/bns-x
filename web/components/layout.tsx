import React, { Suspense } from 'react';
import { Flex, Box, SpaceBetween, Text, Stack } from '@nelson-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { userFormattedBalancesState } from '../common/store';
import { useIsSSR } from '../common/hooks/use-is-ssr';
import { SafeSuspense } from './safe-suspense';
import { stxAddressAtom } from '@micro-stacks/jotai';
import { WalletConnectButton } from './wallet-connect-button';
import { userNameState, userPrimaryNameState } from '../common/store/names';
import { Link } from '@components/link';

export const TokenBalance: React.FC = () => {
  const stxAddress = useAtomValue(stxAddressAtom);
  const name = useAtomValue(userNameState);

  if (!stxAddress) {
    return <WalletConnectButton />;
  }

  return (
    <SpaceBetween spacing="30px">
      {/* <SpaceBetween spacing="15px">
        <Text variant="Body01">{token} tTOK</Text>
        <Text variant="Body01">{stx} STX</Text>
      </SpaceBetween> */}
      <Link href="/migrate" plain>
        Migrate
      </Link>
      {name ? (
        <Link
          href="/profile"
          color="$text"
          textDecoration="none"
          _hover={{ textDecoration: 'underline' }}
        >
          {name}
        </Link>
      ) : null}
      <WalletConnectButton />
    </SpaceBetween>
  );
};

export const CenterBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      maxWidth="600px"
      width="100%"
      borderRadius="$medium"
      border="1px solid $border"
      px="$4"
      py="$4"
      flexGrow="1"
    >
      <SafeSuspense>{children}</SafeSuspense>
    </Box>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; centerBox?: boolean }> = ({
  children,
  centerBox = true,
}) => {
  const isSSR = useIsSSR();
  return (
    <SpaceBetween
      py="20px"
      px="$10"
      pb="40px"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      flexWrap="wrap"
      width="100vw"
      spacing="20px"
    >
      {/* <Box width="100%" height="50px"> */}
      <SpaceBetween spacing="30px" width="100%" height="50px" maxWidth="900px">
        <Text variant="Display01" fontSize="24px !important">
          dots.
        </Text>
        {isSSR ? null : (
          <Suspense fallback={<></>}>
            <TokenBalance />
          </Suspense>
        )}
      </SpaceBetween>
      {/* </Box> */}
      {/* <Flex flexGrow={2} justifyContent="center"> */}
      {centerBox ? (
        <CenterBox>{children}</CenterBox>
      ) : (
        <Box
          width="100%"
          maxWidth="900px"
          // borderRadius="$medium"
          // border="1px solid $border"
          // px="$4"
          py="$4"
          flexGrow="1"
        >
          <SafeSuspense>{children}</SafeSuspense>
        </Box>
      )}

      {/* </Flex> */}
    </SpaceBetween>
  );
};
