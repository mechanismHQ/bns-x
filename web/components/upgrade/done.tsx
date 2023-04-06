import React, { useCallback, useMemo } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { PendingRow, DoneRow, NameHeading, Divider, UpgradeBox } from './rows';
import { CenterBox } from '../layout';
import { migrateTxidAtom, wrapperDeployTxidAtom, migrateRecipientState } from '@store/migration';
import { useAtomValue } from 'jotai';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { currentIsPrimaryState, stxAddressAtom } from '@store/micro-stacks';
import { currentUserUpgradedState } from '@store/names';
import { useAccountPath } from '@common/hooks/use-account-path';
import { BoxLink } from '@components/link';

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
  const isUpgraded = useAtomValue(currentUserUpgradedState);
  const currentIsPrimary = useAtomValue(currentIsPrimaryState);
  const donePath = useMemo(() => {
    if (currentIsPrimary) {
      return '/profile';
    }
    return '/accounts';
  }, [currentIsPrimary]);

  if (!migrateTxid) return null;

  return (
    <UpgradeBox
      bottom={
        isUpgraded ? (
          <Stack spacing="25px">
            <Flex width="100%" justifyContent="center">
              <BoxLink href={donePath}>
                <Button type="big">Done</Button>
              </BoxLink>
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
