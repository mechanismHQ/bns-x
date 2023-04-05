import React, { useCallback } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { PendingRow, DoneRow, NameHeading, Divider, UpgradeBox } from './rows';
import { CenterBox } from '../layout';
import { migrateTxidAtom, wrapperDeployTxidAtom, migrateRecipientState } from '@store/migration';
import { useAtomValue } from 'jotai';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { stxAddressAtom } from '@store/micro-stacks';
import { currentUserUpgradedState } from '@store/names';
import { useAccountPath } from '@common/hooks/use-account-path';

export const TransferredRow: React.FC<{ children?: React.ReactNode }> = () => {
  const recipient = useAtomValue(migrateRecipientState);
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
  const router = useRouter();
  const isUpgraded = useAtomValue(currentUserUpgradedState);
  const profilePath = useAccountPath('/profile');

  const done = useCallback(() => {
    void router.push(profilePath);
  }, [router, profilePath]);

  if (!migrateTxid) return null;

  return (
    <UpgradeBox
      bottom={
        isUpgraded ? (
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
        {isUpgraded ? (
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
