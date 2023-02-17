import React, { useCallback } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { PendingRow, DoneRow, NameHeading, Divider, UpgradeBox } from './rows';
import { CenterBox } from '../layout';
import {
  migrateTxidAtom,
  migrateTxState,
  validRecipientState,
  wrapperDeployTxidAtom,
} from '@store/migration';
import { useAtomValue } from 'jotai/utils';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { useAuth } from '@micro-stacks/react';
import { stxAddressAtom } from '@store/micro-stacks';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';

export const TransferredRow: React.FC<{ children?: React.ReactNode }> = () => {
  const recipient = useAtomValue(validRecipientState);
  const stxAddress = useAtomValue(stxAddressAtom);

  if (recipient === null || recipient === stxAddress) return null;

  return (
    <>
      <Divider />
      <DoneRow>BNSx transferred</DoneRow>
    </>
  );
};

export const UpgradeDone: React.FC<{ children?: React.ReactNode }> = () => {
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const migrateTx = useAtomValue(migrateTxState);
  const router = useRouter();
  const { switchAccounts } = useSwitchAccounts();

  const done = useCallback(() => {
    void router.push({
      pathname: '/profile',
    });
  }, [router]);

  if (!migrateTxid) return null;

  return (
    <UpgradeBox
      bottom={
        migrateTx?.tx_status === 'success' ? (
          <Stack spacing="25px">
            <Flex width="100%" justifyContent="center">
              <Button type="big" onClick={done}>
                Done
              </Button>
            </Flex>
          </Stack>
        ) : null
      }
    >
      <Stack spacing="0">
        <DoneRow txidAtom={wrapperDeployTxidAtom}>Name wrapper created</DoneRow>
        <Divider />
        {migrateTx?.tx_status === 'success' ? (
          <>
            <DoneRow txidAtom={migrateTxidAtom}>BNSx name created</DoneRow>
            <TransferredRow />
          </>
        ) : (
          <PendingRow txidAtom={migrateTxidAtom}>Waiting for confirmations</PendingRow>
        )}
      </Stack>
    </UpgradeBox>
  );
};
