import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Flex, Box, SpaceBetween } from '@nelson-ui/react';
import { SafeSuspense } from '../safe-suspense';
import { Header } from '@components/layout/header';
import { Footer } from '@components/layout/footer';
import { Head } from '@components/head';

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
  return (
    <SpaceBetween
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      flexWrap="wrap"
      width="100%"
      spacing="20px"
    >
      <Head />
      <Header />
      {centerBox ? (
        <>
          <Box flexGrow={1} />
          <CenterBox>{children}</CenterBox>
          <Box flexGrow={1} />
        </>
      ) : (
        <Flex width="100%" maxWidth="1120px" py="$4" flexGrow="1" flexDirection="column">
          <SafeSuspense>{children}</SafeSuspense>
        </Flex>
      )}
      <Footer />
    </SpaceBetween>
  );
};
