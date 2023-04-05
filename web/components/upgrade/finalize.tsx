import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { atom, useAtom, useAtomValue } from 'jotai';
import {
  migrateTxidAtom,
  wrapperDeployTxidAtom,
  wrapperSignatureState,
  migrateRecipientFieldState,
  migrateRecipientState,
  doSendToPrimaryState,
} from '@store/migration';
import { Divider, DoneRow, UpgradeBox } from '@components/upgrade/rows';
import { useWrapperMigrate } from '@common/hooks/use-wrapper-migrate';
import { Checkbox } from '@components/checkbox';
import { Button } from '@components/button';
import { loadable } from 'jotai/utils';
import { useMemo } from 'react';
import { BnsRecipientField } from '@components/bns-recipient-field';
import { currentIsPrimaryState } from '@store/micro-stacks';

export const FinalizeUpgrade: React.FC<{ children?: React.ReactNode }> = () => {
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const doSendElsewhere = useAtomValue(migrateRecipientFieldState.sendElsewhereAtom);
  const recipientAddress = useAtomValue(loadable(migrateRecipientState));
  const wrapperSignature = useAtomValue(wrapperSignatureState);
  const doSendToPrimary = useAtomValue(doSendToPrimaryState);
  const currentIsPrimary = useAtomValue(currentIsPrimaryState);

  const canMigrate = useMemo(() => {
    if (recipientAddress.state !== 'hasData') return false;
    return !!recipientAddress.data;
  }, [recipientAddress]);

  if (!wrapperSignature) return null;

  if (migrateTxid) return null;

  return (
    <UpgradeBox
      bottom={
        <Stack spacing="30px">
          {recipientAddress.state === 'hasData' && recipientAddress.data && (
            <Stack
              width="100%"
              justifyContent="center"
              alignItems="center"
              maxWidth="300px"
              spacing="5px"
            >
              <Text variant="Caption02" color="$text-dim">
                Your BNSx name will be sent to
              </Text>
              <Text variant="Caption02" color="$text-dim">
                {recipientAddress.data}
              </Text>
            </Stack>
          )}
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
        </Stack>
      }
    >
      <DoneRow txidAtom={wrapperDeployTxidAtom}>Name wrapper created</DoneRow>
      {!currentIsPrimary && (
        <>
          <Divider />
          <Stack spacing="13px" p="30px">
            <Stack isInline spacing="$3" alignItems="center">
              <Checkbox atom={doSendToPrimaryState} />
              <Text variant="Label01" color="$onSurface-text">
                Send to primary account
                <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}> (optional)</span>
              </Text>
            </Stack>
          </Stack>
        </>
      )}
      {(!doSendToPrimary || currentIsPrimary) && (
        <>
          <Divider />
          <Stack spacing="13px" p="30px">
            <Stack isInline spacing="$3" alignItems="center">
              <Checkbox atom={migrateRecipientFieldState.sendElsewhereAtom} />
              <Text variant="Label01" color="$onSurface-text">
                Send to different address
                <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}> (optional)</span>
              </Text>
            </Stack>
            {doSendElsewhere && <BnsRecipientField recipientState={migrateRecipientFieldState} />}
          </Stack>
        </>
      )}
    </UpgradeBox>
  );
};
