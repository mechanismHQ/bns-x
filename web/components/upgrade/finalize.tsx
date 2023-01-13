import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';
import { atom, useAtom, useAtomValue } from 'jotai';
import { bnsContractState, clarigenAtom, nameRegistryState, txReceiptState } from '@store/index';
import {
  migrateTxidAtom,
  wrapperContractIdAtom,
  wrapperDeployTxidAtom,
  upgradeRecipientAtom,
  migrateTxState,
  recipientAddrAtom,
  sendElsewhereAtom,
  validRecipientState,
  recipientIsBnsState,
} from '@store/migration';
import { Divider, DoneRow, NameHeading, PendingRow } from '@components/upgrade/rows';
import { useWrapperMigrate } from '@common/hooks/use-wrapper-migrate';
import { Checkbox } from '@components/checkbox';
import { Input } from '@components/form';
import { useInput } from '@common/hooks/use-input';
import { CenterBox } from '@components/layout';
import { Button } from '@components/button';
import { loadable, useAtomCallback } from 'jotai/utils';
import { networkAtom, stxAddressAtom } from '@micro-stacks/jotai';
import { validateStacksAddress } from 'micro-stacks/crypto';
import { asciiToBytes } from 'micro-stacks/common';
import { useEffect } from 'react';
import { CheckIcon } from '@components/icons/check';
import { useMemo } from 'react';

const validatedRecipientInputAtom = atom('');

export const FinalizeUpgrade: React.FC<{ children?: React.ReactNode }> = () => {
  const contractId = useAtomValue(wrapperContractIdAtom);
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const doSendElsewhere = useAtomValue(sendElsewhereAtom);
  const recipientInput = useInput(useAtom(upgradeRecipientAtom));
  const recipient = useAtomValue(upgradeRecipientAtom);
  const recipientAddress = useAtomValue(loadable(validRecipientState));
  // const recipientAddress = useAtomValue(recipientAddrAtom);
  const validatedInput = useAtomValue(validatedRecipientInputAtom);
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

  const canMigrate = useMemo(() => {
    if (recipientAddress.state !== 'hasData') return false;
    return !!recipientAddress.data;
  }, [recipientAddress, doSendElsewhere, recipient]);

  useEffect(() => {
    console.log('Recipient is', recipientAddress);
    console.log('Validated input is', validatedInput);
  }, [recipientAddress, validatedInput]);

  if (!contractId) return null;
  const contractName = contractId.split('.')[1];

  if (migrateTxid) return null;

  return (
    <Stack width="100%" alignItems={'center'} spacing="0">
      <NameHeading />
      <CenterBox mt="20px" mb="30px">
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
              <>
                <Input
                  placeholder="Enter a BNS name or Stacks address"
                  {...recipientInput.props}
                  autoFocus={true}
                  // onBlur={fetchRecipientAddress}
                />
                {bnsInputValid ? (
                  <Stack isInline spacing="$3" alignItems="center">
                    <CheckIcon />
                    <Text variant="Label02" color="$onSurface-text-subdued">
                      BNS Name looks good
                    </Text>
                  </Stack>
                ) : null}
                {bnsInputInvalid ? (
                  <Stack isInline spacing="$3" alignItems="center">
                    <CheckIcon />
                    <Text variant="Label02" color="$onSurface-text-subdued">
                      Invalid BNS name
                    </Text>
                  </Stack>
                ) : null}
              </>
            ) : null}
          </Stack>
        </Stack>
      </CenterBox>
      <Flex width="100%" justifyContent="center">
        <Button
          width="260px"
          disabled={!canMigrate}
          onClick={() => {
            if (canMigrate) void migrate();
          }}
        >
          {isRequestPending ? 'Waiting' : 'Finalize'}
        </Button>
      </Flex>
    </Stack>
  );
};
