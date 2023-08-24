import React, { useCallback, useEffect } from 'react';
import { Box, Flex, Stack } from '@nelson-ui/react';
import { Text } from './text';
import { Button } from '@components/button';
import { Link } from '@components/link';
import { useAuth } from '@micro-stacks/react';
import { useRouter } from 'next/router';
import { Profile } from '@components/p/profile';
import { ONLY_INSCRIPTIONS } from '@common/constants';
import { Inscribe } from '@components/p/inscribe';
import { useConnect } from '@common/hooks/use-connect';

export const Home: React.FC<{ children?: React.ReactNode }> = () => {
  const { openAuthRequest, isSignedIn } = useConnect();

  const getStarted = useCallback(() => {
    void openAuthRequest();
  }, [openAuthRequest]);

  if (ONLY_INSCRIPTIONS) {
    return <Inscribe />;
  }

  if (isSignedIn) {
    return <Profile />;
  }

  return (
    <>
      <Box flexGrow={1} />
      <Stack spacing="93px" pl="29px" pr="17px">
        <Stack spacing="34px">
          <Stack spacing="10px">
            <Text variant="Display02">Upgrade to BNSx</Text>
            <Text variant="Display02">Manage all your names</Text>
          </Stack>
          <Box>
            <Button type="big" onClick={getStarted}>
              Get started
            </Button>
          </Box>
        </Stack>
        <Stack spacing="9px">
          <Link
            href="https://docs.bns.xyz"
            target="_blank"
            textDecoration="none"
            variant="Heading03"
            color="$text"
          >
            <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}>Learn more</span> about
            BNSx
          </Link>
          <Link
            href="https://discord.com/channels/1024525432403537982/1080863724451139624"
            target="_blank"
            textDecoration="none"
            variant="Heading03"
            color="$text"
          >
            <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}>Questions?</span> ask in
            Discord
          </Link>
        </Stack>
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
