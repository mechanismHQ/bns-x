import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { atom, useAtom, useAtomValue } from 'jotai';
import {
  migrateTxidAtom,
  wrapperDeployTxidAtom,
  upgradeRecipientAtom,
  sendElsewhereAtom,
  validRecipientState,
  recipientIsBnsState,
  wrapperSignatureState,
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

export const FinalizeUpgrade: React.FC<{ children?: React.ReactNode }> = () => {
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const doSendElsewhere = useAtomValue(sendElsewhereAtom);
  const recipientInput = useInput(useAtom(upgradeRecipientAtom));
  const recipient = useAtomValue(upgradeRecipientAtom);
  const recipientAddress = useAtomValue(loadable(validRecipientState));
  const wrapperSignature = useAtomValue(wrapperSignatureState);
  const isBNS = useAtomValue(recipientIsBnsState);

  const bnsInputValid = useMemo(() => {
    if (!isBNS) return false;
    if (recipientAddress.state === 'hasData') {
      return !!recipientAddress.data;
    }
    return false;
  }, [isBNS, recipientAddress]);

  const bnsInputInvalid = useMemo(() => {
    if (!isBNS) return false;
    if (recipientAddress.state !== 'hasData') return false;
    return !recipientAddress.data;
  }, [isBNS, recipientAddress]);

  const stxAddrInvalid = useMemo(() => {
    if (isBNS || !doSendElsewhere || !recipient) return false;
    if (recipientAddress.state !== 'hasData') return false;
    return !recipientAddress.data;
  }, [isBNS, doSendElsewhere, recipientAddress, recipient]);

  const stxAddrValid = useMemo(() => {
    if (isBNS || !doSendElsewhere) return false;
    if (recipientAddress.state !== 'hasData') return false;
    return !!recipientAddress.data;
  }, [isBNS, doSendElsewhere, recipientAddress]);

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
          <Checkbox atom={sendElsewhereAtom} />
          <Text variant="Label01" color="$onSurface-text">
            Send to different address
            <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}> (optional)</span>
          </Text>
        </Stack>
        {doSendElsewhere ? (
          <>
            <Input
              placeholder="Enter a BNS name or Stacks address"
              {...recipientInput.props}
              autoFocus={true}
            />
            {recipientAddress.state === 'loading' ? (
              <Stack isInline spacing="$3" alignItems="center">
                <Spinner size={16} />
                <Text variant="Label02" color="$onSurface-text-subdued">
                  Fetching BNS name
                </Text>
              </Stack>
            ) : (
              <>
                {bnsInputValid && (
                  <Stack isInline spacing="$3" alignItems="center">
                    <CheckIcon />
                    <Text variant="Label02" color="$onSurface-text-subdued">
                      BNS Name looks good
                    </Text>
                  </Stack>
                )}
                {bnsInputInvalid && (
                  <Stack isInline spacing="$3" alignItems="center">
                    <ErrorIcon />
                    <Text variant="Label02" color="$text-error">
                      Invalid BNS name
                    </Text>
                  </Stack>
                )}
                {stxAddrInvalid && (
                  <Stack isInline spacing="$3" alignItems="center">
                    <ErrorIcon />
                    <Text variant="Label02" color="$text-error">
                      Invalid Stacks address
                    </Text>
                  </Stack>
                )}
                {stxAddrValid && (
                  <Stack isInline spacing="$3" alignItems="center">
                    <CheckIcon />
                    <Text variant="Label02" color="$onSurface-text-subdued">
                      Stacks address looks good
                    </Text>
                  </Stack>
                )}
              </>
            )}
          </>
        ) : null}
      </Stack>
    </UpgradeBox>
  );
};
