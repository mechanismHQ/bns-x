import React, { Suspense, useMemo } from 'react';
import { Flex, Box, SpaceBetween, Stack, BoxProps } from '@nelson-ui/react';
import { Text } from './text';
import { useAtom, useAtomValue } from 'jotai';
import { userFormattedBalancesState } from '../common/store';
import { useIsSSR } from '../common/hooks/use-is-ssr';
import { SafeSuspense } from './safe-suspense';
import { stxAddressAtom } from '@micro-stacks/jotai';
import { WalletConnectButton } from './wallet-connect-button';
import { userNameState, userPrimaryNameState } from '../common/store/names';
import { Link, LinkProps } from '@components/link';
import { truncateMiddle } from '@common/utils';
import { useGradient } from '@common/hooks/use-gradient';

export const TokenBalance: React.FC = () => {
  const stxAddress = useAtomValue(stxAddressAtom);
  const name = useAtomValue(userNameState);

  const gradient = useGradient(name || stxAddress || '');

  if (!stxAddress) {
    return <WalletConnectButton />;
  }

  return (
    <Stack isInline spacing="8px" alignItems={'center'}>
      <Box size="28px" borderRadius="50%" background={gradient} />
      {name ? (
        <Link
          href="/profile"
          color="$text"
          variant="Label01"
          textDecoration="none"
          _hover={{ textDecoration: 'underline' }}
        >
          {name}
        </Link>
      ) : (
        <HeaderLink href="/profile">{truncateMiddle(stxAddress)}</HeaderLink>
      )}
    </Stack>
  );
};

export const HeaderLink: React.FC<
  LinkProps & {
    children?: React.ReactNode;
    href: string;
    target?: string;
  }
> = ({ children, href, target, ...rest }) => {
  return (
    <Box px="12px" py="10px">
      <Link
        variant="Label01"
        textDecoration="none"
        color="$onSurface-text"
        href={href}
        target={target}
        {...rest}
      >
        {children}
      </Link>
    </Box>
  );
};

export const CenterBox: React.FC<{ children: React.ReactNode } & BoxProps> = ({
  children,
  ...rest
}) => {
  return (
    <Box maxWidth="460px" width="100%" borderRadius="$medium" border="1px solid $border" {...rest}>
      <SafeSuspense>{children}</SafeSuspense>
    </Box>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; centerBox?: boolean }> = ({
  children,
  centerBox = true,
}) => {
  const isSSR = useIsSSR();

  const year = useMemo(() => {
    return new Date().getFullYear();
  }, []);
  return (
    <SpaceBetween
      // pt="20px"
      // px="$10"
      // pb="40px"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      flexWrap="wrap"
      width="100%"
      spacing="20px"
    >
      {/* <Box width="100%" height="50px"> */}
      <SpaceBetween
        spacing="30px"
        width="100%"
        py="25px"
        // height="50px"
        maxWidth="1120px"
        alignItems={'center'}
      >
        <Text variant="Display01" fontSize="24px !important" lineHeight="24px !important">
          dots.
        </Text>
        <Stack isInline spacing="8px">
          {/* <HeaderLink href="">Mint</HeaderLink>
          <HeaderLink href="">Tools</HeaderLink> */}

          {isSSR ? null : (
            <Suspense fallback={<></>}>
              <TokenBalance />
            </Suspense>
          )}
        </Stack>
      </SpaceBetween>
      {/* </Box> */}
      {/* <Flex flexGrow={2} justifyContent="center"> */}
      {centerBox ? (
        <>
          <Box flexGrow={1} />
          <CenterBox>{children}</CenterBox>
          <Box flexGrow={1} />
        </>
      ) : (
        <Flex
          width="100%"
          maxWidth="1120px"
          // borderRadius="$medium"
          // border="1px solid $border"
          // px="$4"
          py="$4"
          flexGrow="1"
          flexDirection="column"
        >
          <SafeSuspense>{children}</SafeSuspense>
        </Flex>
      )}

      <SpaceBetween
        isInline
        width="100%"
        maxWidth="1120px"
        pt="25px"
        pb="45px"
        pl="17px"
        pr="29px"
        alignItems="center"
      >
        <Stack isInline spacing="8px">
          <HeaderLink href="javascript:void(0)" color="$onSurface-text-subdued">
            Discord
          </HeaderLink>
          <HeaderLink href="javascript:void(0)" color="$onSurface-text-subdued">
            Twitter
          </HeaderLink>
          <HeaderLink href="javascript:void(0)" color="$onSurface-text-subdued">
            Docs
          </HeaderLink>
          {/* <HeaderLink href="javascript:void(0)" color="$onSurface-text-subdued">
            Mint BNS names
          </HeaderLink> */}
          <HeaderLink href="/faucet" color="$onSurface-text-subdued">
            Testnet faucet
          </HeaderLink>
          <HeaderLink href="javascript:void(0)" color="$onSurface-text-subdued">
            Sign out
          </HeaderLink>
        </Stack>
        <Text variant="Body01" color="$onSurface-text-dim">
          © {year} dots.so
        </Text>
      </SpaceBetween>
      {/* </Flex> */}
    </SpaceBetween>
  );
};

export const FooterLink: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <Box px="12px" py="10px">
      <Text variant="Label01" color="$onSurface-text-subdued">
        {children}
      </Text>
    </Box>
  );
};
