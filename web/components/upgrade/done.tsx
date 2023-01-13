import React, { useCallback } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { PendingRow, DoneRow, NameHeading, Divider } from './rows';
import { CenterBox } from '../layout';
import { migrateTxidAtom, migrateTxState, wrapperDeployTxidAtom } from '@store/migration';
import { useAtomValue } from 'jotai/utils';
import { Button } from '@components/button';
import { useRouter } from 'next/router';

export const UpgradeDone: React.FC<{ children?: React.ReactNode }> = () => {
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const migrateTx = useAtomValue(migrateTxState);
  const router = useRouter();

  const done = useCallback(() => {
    void router.push({
      pathname: '/profile',
    });
  }, [router]);

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
        <Flex width="100%" justifyContent="center">
          <Button width="260px" onClick={done}>
            Yay! Done
          </Button>
        </Flex>
      ) : null}
    </Stack>
  );
};
