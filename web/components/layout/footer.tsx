/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Suspense, useMemo } from 'react';
import { SpaceBetween, Box } from '@nelson-ui/react';
import { Text } from '../text';
import type { LinkProps, Url } from '@components/link';
import { Link } from '@components/link';
import { styled } from '@common/theme';
import { useAtomValue } from 'jotai';
import { isMainnetState } from '@store/index';
import { L1_ENABLED, ONLY_INSCRIPTIONS } from '@common/constants';
import { btnShiftActiveProps } from '@components/button';
import { useAccountPath } from '@common/hooks/use-account-path';

const FooterContainer = styled(SpaceBetween, {
  flexDirection: 'row',
  alignItems: 'center',
  '@bp1': {
    flexDirection: 'column',
    pt: '10px',
    alignItems: 'flex-start',
    gap: '0',
    // alignItems: '',
  },
  variants: {
    outer: {
      true: {
        '@bp1': {
          pl: '29px',
          gap: '10px !important',
        },
      },
    },
  },
});

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
    href: Url;
    target?: string;
  }
> = ({ children, href, target, ...rest }) => {
  return (
    <HeaderLinkBox
      py="10px"
      px="10px"
      position="relative"
      borderRadius="10px"
      _active={btnShiftActiveProps}
      _hover={{
        backgroundColor: '$surface-surface--hovered',
      }}
    >
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

export const Footer: React.FC<{ children?: React.ReactNode }> = () => {
  const year = useMemo(() => {
    return new Date().getFullYear();
  }, []);
  const isMainnet = useAtomValue(isMainnetState);
  const faucetPath = useAccountPath('/faucet');
  const registerPath = useAccountPath('/register');
  return (
    <FooterContainer
      // isInline
      width="100%"
      maxWidth="1120px"
      pt="25px"
      pb="45px"
      pl="17px"
      pr="29px"
      alignItems="center"
      outer
    >
      <FooterContainer spacing="8px">
        {!ONLY_INSCRIPTIONS && (
          <>
            <HeaderLink
              href="https://discord.com/channels/1024525432403537982/1080863724451139624"
              color="$onSurface-text-subdued"
              target="_blank"
            >
              Discord
            </HeaderLink>
            <HeaderLink
              href="https://twitter.com/dotsbtc"
              target="_blank"
              color="$onSurface-text-subdued"
            >
              Twitter
            </HeaderLink>
            <HeaderLink
              onClick={() => {}}
              href="https://docs.bns.xyz"
              target="_blank"
              color="$onSurface-text-subdued"
            >
              Docs
            </HeaderLink>
          </>
        )}
        {L1_ENABLED && (
          <HeaderLink href="/l1-names" color="$onSurface-text-subdued">
            BNS names on L1
          </HeaderLink>
        )}

        <HeaderLink onClick={() => {}} href={registerPath} color="$onSurface-text-subdued">
          Register BNS names
        </HeaderLink>
        {!isMainnet && (
          <HeaderLink href={faucetPath} color="$onSurface-text-subdued">
            Testnet faucet
          </HeaderLink>
        )}
      </FooterContainer>
      <Text variant="Body01" color="$onSurface-text-dim">
        {ONLY_INSCRIPTIONS ? '' : `© ${year} dots.so`}
      </Text>
    </FooterContainer>
  );
};
