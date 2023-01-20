import React from 'react';
import { Box, Flex, Stack } from '@nelson-ui/react';
import { Text } from './text';
import { useRouter } from 'next/router';
import { Button } from '@components/button';

export const Name: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;

  return (
    <>
      <Box flexGrow={1} />
      <Stack
        width="100%"
        spacing="0"
        // justifyContent="center"
        // alignItems="center"
        alignContent="center"
        textAlign="center"
      >
        <Text width="100%" variant="Display02">
          Coming soon
        </Text>
        <Text width="100%" mt="15px" variant="Body02">
          We will be adding about one zillion name management features soon!
        </Text>
        <Button
          type="big"
          mx="auto"
          mt="49px"
          onClick={async () => {
            await router.push({ pathname: '/' });
          }}
        >
          Ok bye 👋
        </Button>
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
