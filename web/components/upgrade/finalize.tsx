import React from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { atom, useAtom, useAtomValue } from 'jotai';
import { txReceiptState } from '@store/index';
import {
  migrateTxidAtom,
  wrapperContractIdAtom,
  wrapperDeployTxidAtom,
  upgradeRecipientAtom,
} from '@store/migration';
import { Divider, DoneRow, PendingRow } from '@components/upgrade/rows';
import { useWrapperMigrate } from '@common/hooks/use-wrapper-migrate';
import { Checkbox } from '@components/checkbox';
import { Input } from '@components/form';
import { useInput } from '@common/hooks/use-input';

const sendElsewhereAtom = atom(false);

export const FinalizeUpgrade: React.FC<{ children?: React.ReactNode }> = () => {
  const contractId = useAtomValue(wrapperContractIdAtom);
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const migrateTx = useAtomValue(txReceiptState(migrateTxid));
  const doSendElsewhere = useAtomValue(sendElsewhereAtom);
  const recipientInput = useInput(useAtom(upgradeRecipientAtom));
  if (!contractId) return null;
  const contractName = contractId.split('.')[1];

  if (migrateTx?.tx_status === 'success') return null;

  return (
    <Stack spacing="0">
      <DoneRow txidAtom={wrapperDeployTxidAtom}>Name wrapper created</DoneRow>
      <Divider />
      <Stack spacing="13px" p="30px">
        <Stack isInline spacing="$3" alignItems="center">
          <Checkbox atom={sendElsewhereAtom} />
          <Text variant="Label01" color="$onSurface-text">
            Send to different address
            <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}> (optional)</span>
          </Text>
        </Stack>
        {doSendElsewhere ? (
          <Input
            placeholder="Enter a BNS name or Stacks address"
            {...recipientInput.props}
            autoFocus={true}
          />
        ) : null}
      </Stack>
      {/* <PendingRow txidAtom={wrapperDeployTxidAtom}>Waiting</PendingRow> */}
    </Stack>
  );
};
