import React, { Suspense, useMemo } from 'react';
import { SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { useAuth } from '@micro-stacks/react';
import { HeaderLink } from '@components/layout/header';

export const Footer: React.FC<{ children?: React.ReactNode }> = () => {
  const { signOut } = useAuth();
  const year = useMemo(() => {
    return new Date().getFullYear();
  }, []);
  return (
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
        <HeaderLink onClick={() => {}} href="#" color="$onSurface-text-subdued">
          Discord
        </HeaderLink>
        <HeaderLink onClick={() => {}} href="#" color="$onSurface-text-subdued">
          Twitter
        </HeaderLink>
        <HeaderLink onClick={() => {}} href="#" color="$onSurface-text-subdued">
          Docs
        </HeaderLink>
        {/* <HeaderLink onClick={() => {}} href="#" color="$onSurface-text-subdued">
            Mint BNS names
          </HeaderLink> */}
        <HeaderLink href="/faucet" color="$onSurface-text-subdued">
          Testnet faucet
        </HeaderLink>
        <HeaderLink
          // onClick={() => {}}
          href="#"
          color="$onSurface-text-subdued"
          onClick={async () => {
            await signOut();
          }}
        >
          Sign out
        </HeaderLink>
      </Stack>
      <Text variant="Body01" color="$onSurface-text-dim">
        © {year} dots.so
      </Text>
    </SpaceBetween>
  );
};
