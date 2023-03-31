import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { atom, useAtom, useAtomValue } from 'jotai';
import {
  migrateTxidAtom,
  wrapperDeployTxidAtom,
  wrapperSignatureState,
  migrateRecipientState,
} from '@store/migration';
import { Divider, DoneRow, NameHeading, PendingRow, UpgradeBox } from '@components/upgrade/rows';
import { useWrapperMigrate } from '@common/hooks/use-wrapper-migrate';
import { Checkbox } from '@components/checkbox';
import { Input } from '@components/form';
import { useInput } from '@common/hooks/use-input';
import { Button } from '@components/button';
import { loadable } from 'jotai/utils';
import { CheckIcon } from '@components/icons/check';
import { useMemo } from 'react';
import { Spinner } from '@components/spinner';
import { ErrorIcon } from '@components/icons/error';
import { BnsRecipientField } from '@components/bns-recipient-field';

export const FinalizeUpgrade: React.FC<{ children?: React.ReactNode }> = () => {
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const doSendElsewhere = useAtomValue(migrateRecipientState.sendElsewhereAtom);
  const recipientAddress = useAtomValue(loadable(migrateRecipientState.validRecipientState));
  const wrapperSignature = useAtomValue(wrapperSignatureState);

  const canMigrate = useMemo(() => {
    if (recipientAddress.state !== 'hasData') return false;
    return !!recipientAddress.data;
  }, [recipientAddress]);

  if (!wrapperSignature) return null;

  if (migrateTxid) return null;

  return (
    <UpgradeBox
      bottom={
        <Flex width="100%" justifyContent="center">
          <Button
            type="big"
            disabled={!canMigrate}
            onClick={() => {
              if (canMigrate) void migrate();
            }}
          >
            {isRequestPending ? 'Waiting' : 'Finalize'}
          </Button>
        </Flex>
      }
    >
      <DoneRow txidAtom={wrapperDeployTxidAtom}>Name wrapper created</DoneRow>
      <Divider />
      <Stack spacing="13px" p="30px">
        <Stack isInline spacing="$3" alignItems="center">
          <Checkbox atom={migrateRecipientState.sendElsewhereAtom} />
          <Text variant="Label01" color="$onSurface-text">
            Send to different address
            <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}> (optional)</span>
          </Text>
        </Stack>
        {doSendElsewhere && <BnsRecipientField recipientState={migrateRecipientState} />}
      </Stack>
    </UpgradeBox>
  );
};
