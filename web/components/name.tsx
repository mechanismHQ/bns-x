import React, { useCallback } from 'react';
import { Box, Flex, Stack } from '@nelson-ui/react';
import { Text } from './text';
import { useRouter } from 'next/router';
import { Button } from '@components/button';
import { useAtomValue } from 'jotai';
import { nameDetailsAtom } from '@store/names';
import { useUnwrap } from '@common/hooks/use-unwrap';
import { getTxUrl } from '@common/utils';
import { networkAtom } from '@store/micro-stacks';
import { useAtomCallback } from 'jotai/utils';
import { unwrapTxidAtom } from '@store/profile';

export const Name: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const showUnwrap = 'unwrap' in router.query;
  const nameDetails = useAtomValue(nameDetailsAtom(name));
  const { unwrap, unwrapTxid, isRequestPending } = useUnwrap(name);

  const openUnwrap = useAtomCallback(
    useCallback(get => {
      const txid = get(unwrapTxidAtom);
      const network = get(networkAtom);
      if (!txid) return;
      const txUrl = getTxUrl(txid, network);
      window.open(txUrl, '_blank');
    }, [])
  );

  if (nameDetails === null) {
    return (
      <>
        <Box flexGrow={1} />
        <Box>
          <Text variant="Display02">Name not found</Text>
        </Box>
        <Box flexGrow={1} />
      </>
    );
  }

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
        <Flex mt="49px" width="100%" justifyContent={'center'}>
          {showUnwrap ? (
            <Button type="big" mx="auto" disabled={isRequestPending} onClick={unwrap}>
              {isRequestPending ? 'waiting..' : '🤫 Unwrap'}
            </Button>
          ) : (
            <Button
              type="big"
              mx="auto"
              // mt="49px"
              onClick={async () => {
                await router.push({ pathname: '/' });
              }}
            >
              Ok bye 👋
            </Button>
          )}
        </Flex>
        {typeof unwrapTxid !== 'undefined' && (
          <Flex mt="49px" width="100%" justifyContent={'center'}>
            <Button type="big" mx="auto" secondary onClick={openUnwrap}>
              View Unwrap Transaction
            </Button>
          </Flex>
        )}
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
