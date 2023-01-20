import React, { Suspense, useMemo } from 'react';
import { Flex, Box, SpaceBetween, Stack, BoxProps } from '@nelson-ui/react';
import { Text } from '../text';
import { useAtom, useAtomValue } from 'jotai';
import { userFormattedBalancesState } from '../../common/store';
import { useIsSSR } from '../../common/hooks/use-is-ssr';
import { SafeSuspense } from '../safe-suspense';
import { stxAddressAtom } from '@store/micro-stacks';
import { WalletConnectButton } from '../wallet-connect-button';
import { userNameState, userPrimaryNameState } from '../../common/store/names';
import { Link, LinkProps } from '@components/link';
import { truncateMiddle } from '@common/utils';
import { useGradient } from '@common/hooks/use-gradient';
import { useAuth } from '@micro-stacks/react';
import { LogoIcon } from '@components/icons/logo';
import { useRouter } from 'next/router';
import { styled } from '@common/theme';

export const TokenBalance: React.FC = () => {
  const stxAddress = useAtomValue(stxAddressAtom);
  const name = useAtomValue(userNameState);

  const gradient = useGradient(name || stxAddress || 'NONE');

  if (!stxAddress) {
    return <WalletConnectButton />;
  }

  return (
    <Stack isInline spacing="8px" alignItems={'center'}>
      <Box size="28px" borderRadius="50%" background={gradient} />
      <Box px="12px">
        <Text variant="Label01">{name ? name : truncateMiddle(stxAddress)}</Text>
      </Box>
    </Stack>
  );
};

const HeaderLinkBox = styled(Box, {
  pl: '12px',
  pr: '12px',
  '@bp1': {
    pl: '0',
  },
});

export const HeaderLink: React.FC<
  LinkProps & {
    children?: React.ReactNode;
    href: string;
    target?: string;
  }
> = ({ children, href, target, ...rest }) => {
  return (
    <HeaderLinkBox py="10px">
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
    </HeaderLinkBox>
  );
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
