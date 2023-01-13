import React from 'react';
import { Box, Flex, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { useAtomValue } from 'jotai';
import {
  migrateTxidAtom,
  wrapperContractIdAtom,
  wrapperDeployTxidAtom,
} from '../../common/store/migration';
import { useWrapperMigrate } from '../../common/hooks/use-wrapper-migrate';
import { Button } from '../button';
import { TransactionLink } from '../link';
import { txReceiptState } from '@store/index';
import { DoneRow, PendingRow } from './rows';

export const MigrateFinalizeStep: React.FC<{ children?: React.ReactNode }> = () => {
  const contractId = useAtomValue(wrapperContractIdAtom);
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const migrateTx = useAtomValue(txReceiptState(migrateTxid));
  if (!contractId) return null;
  const contractName = contractId.split('.')[1];

  if (migrateTx?.tx_status === 'success') return null;

  return (
    <Stack>
      <DoneRow txidAtom={wrapperDeployTxidAtom}>Wrapper deployed</DoneRow>

      {migrateTxid ? (
        <PendingRow txidAtom={migrateTxidAtom}>Minting your name</PendingRow>
      ) : (
        <>
          <Text variant="Body02">One last step - let&apos;s mint your name!</Text>
          <Box>
            <Button onClick={migrate} disabled={isRequestPending}>
              Migrate
            </Button>
          </Box>
        </>
      )}
    </Stack>
  );
};
