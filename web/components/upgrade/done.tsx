import React, { useCallback } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { PendingRow, DoneRow, NameHeading, Divider } from './rows';
import { CenterBox } from '../layout';
import { migrateTxidAtom, migrateTxState, wrapperDeployTxidAtom } from '@store/migration';
import { useAtomValue } from 'jotai/utils';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { useAuth } from '@micro-stacks/react';

export const UpgradeDone: React.FC<{ children?: React.ReactNode }> = () => {
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const migrateTx = useAtomValue(migrateTxState);
  const router = useRouter();
  const { openAuthRequest } = useAuth();

  const done = useCallback(() => {
    void router.push({
      pathname: '/profile',
    });
  }, [router]);

  const switchAccounts = useCallback(async () => {
    await openAuthRequest({
      async onFinish() {
        await router.push({
          pathname: '/profile',
        });
      },
    });
  }, [openAuthRequest, router]);

  if (!migrateTxid) return null;

  return (
    <Stack width="100%" alignItems={'center'} spacing="0">
      <NameHeading />
      <CenterBox mt="20px" mb="30px">
        <Stack spacing="0">
          <DoneRow txidAtom={wrapperDeployTxidAtom}>Name wrapper created</DoneRow>
          <Divider />
          {migrateTx?.tx_status === 'success' ? (
            <DoneRow txidAtom={migrateTxidAtom}>BNSx name created</DoneRow>
          ) : (
            <PendingRow txidAtom={migrateTxidAtom}>Waiting for confirmations</PendingRow>
          )}
        </Stack>
      </CenterBox>
      {migrateTx?.tx_status === 'success' ? (
        <Stack spacing="25px">
          <Flex width="100%" justifyContent="center">
            <Button type="big" onClick={done}>
              Done
            </Button>
          </Flex>
          <Flex width="100%" justifyContent="center">
            <Button type="big" secondary onClick={switchAccounts}>
              Switch accounts
            </Button>
          </Flex>
        </Stack>
      ) : null}
    </Stack>
  );
};
