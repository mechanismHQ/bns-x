import React from 'react';
import { Box, Stack, SpaceBetween, Flex } from '@nelson-ui/react';
import { Text } from '../text';
import { useAtomValue } from 'jotai';
import { migrateTxidAtom, wrapperDeployTxidAtom } from '@store/migration';
import { txReceiptState } from '@store/index';
import { CheckIcon } from '@components/icons/check';
import { ExternalTx } from '@components/icons/external-tx';
import { DoneRow } from '@components/migrate-old/rows';

export const MigrateDone: React.FC<{ children?: React.ReactNode }> = () => {
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const deployTxid = useAtomValue(wrapperDeployTxidAtom);
  const migrateTx = useAtomValue(txReceiptState(migrateTxid));

  if (migrateTx?.tx_status !== 'success') return null;
  return (
    <Stack maxWidth="400px">
      <DoneRow txidAtom={wrapperDeployTxidAtom}>Wrapper deployed</DoneRow>
      <DoneRow txidAtom={migrateTxidAtom}>Name minted</DoneRow>
    </Stack>
  );
};
