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
} from '@store/migration';
import { Divider, DoneRow, NameHeading, PendingRow } from '@components/upgrade/rows';
import { useWrapperMigrate } from '@common/hooks/use-wrapper-migrate';
import { Checkbox } from '@components/checkbox';
import { Input } from '@components/form';
import { useInput } from '@common/hooks/use-input';
import { CenterBox } from '@components/layout';
import { Button } from '@components/button';
import { useAtomCallback } from 'jotai/utils';
import { networkAtom, stxAddressAtom } from '@micro-stacks/jotai';
import { validateStacksAddress } from 'micro-stacks/crypto';
import { asciiToBytes } from 'micro-stacks/common';
import { useEffect } from 'react';
import { CheckIcon } from '@components/icons/check';
import { useMemo } from 'react';

const sendElsewhereAtom = atom(false);

const validatedRecipientInputAtom = atom('');

export const FinalizeUpgrade: React.FC<{ children?: React.ReactNode }> = () => {
  const contractId = useAtomValue(wrapperContractIdAtom);
  const { migrate, isRequestPending } = useWrapperMigrate();
  const migrateTxid = useAtomValue(migrateTxidAtom);
  // const migrateTx = useAtomValue(txReceiptState(migrateTxid));
  const migrateTx = useAtomValue(migrateTxState);
  const doSendElsewhere = useAtomValue(sendElsewhereAtom);
  const recipientInput = useInput(useAtom(upgradeRecipientAtom));
  const recipient = useAtomValue(upgradeRecipientAtom);
  const recipientAddress = useAtomValue(recipientAddrAtom);
  const validatedInput = useAtomValue(validatedRecipientInputAtom);
  const isBNS = useMemo(() => {
    return recipientInput.value.split('.').length === 2;
  }, [recipientInput.value]);
  // const isBNS = recipientInput.value.split('.').length === 2;
  const bnsInputValid = useMemo(() => {
    if (!isBNS) return false;
    if (doSendElsewhere && recipientAddress && validatedInput === recipientInput.value) return true;
    return false;
  }, [isBNS, doSendElsewhere, recipientAddress, recipientInput.value]);

  const fetchRecipientAddress = useAtomCallback(
    useCallback(async (get, set) => {
      const recipient = get(upgradeRecipientAtom).trim();
      set(validatedRecipientInputAtom, recipient);
      console.log('recipient', recipient);
      if (!recipient || !get(sendElsewhereAtom)) {
        const me = get(stxAddressAtom);
        set(recipientAddrAtom, me || null);
        return;
      }
      if ((recipient.startsWith('SP') || recipient.startsWith('ST')) && !recipient.includes('.')) {
        set(recipientAddrAtom, validateStacksAddress(recipient) ? recipient : null);
        return;
      }
      const network = get(networkAtom);
      const clarigen = get(clarigenAtom);
      const registry = get(nameRegistryState);
      const bns = get(bnsContractState);
      const [nameStr, namespaceStr] = recipient.split('.');
      console.log(`Fetching addr for BNS name ${nameStr}.${namespaceStr}`);
      const name = asciiToBytes(nameStr);
      const namespace = asciiToBytes(namespaceStr);

      const [xName, v1Name] = await Promise.all([
        clarigen.ro(registry.getNameProperties({ name, namespace })),
        clarigen.ro(bns.nameResolve({ name, namespace })),
      ]);
      if (xName !== null) {
        set(recipientAddrAtom, xName.owner);
        return;
      }
      console.log('v1Name', v1Name);
      if (v1Name.isOk) {
        console.log(`Setting name from v1 to addr`, v1Name.value.owner);
        set(recipientAddrAtom, v1Name.value.owner);
        return;
      }
      set(recipientAddrAtom, null);
      return;
    }, [])
  );

  const canMigrate = useMemo(() => {
    if (!recipientAddress) return false;
    if (doSendElsewhere) {
      console.log('validating');
      console.log('input matches validated', recipient === validatedInput);
      console.log('validatedInput', validatedInput);
      if (!recipient.trim()) return false;
      // console.log(recipient &&);
      return recipient === validatedInput;
    }
    return true;
  }, [recipientAddress, doSendElsewhere, recipient]);

  useEffect(() => {
    console.log('Recipient is', recipientAddress);
    console.log('Validated input is', validatedInput);
  }, [recipientAddress, validatedInput]);

  useEffect(() => {
    void fetchRecipientAddress();
  }, []);

  if (!contractId) return null;
  const contractName = contractId.split('.')[1];

  if (migrateTx?.tx_status === 'success') return null;

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
                  onBlur={fetchRecipientAddress}
                />
                {bnsInputValid ? (
                  <Stack isInline spacing="$3" alignItems="center">
                    <CheckIcon />
                    <Text variant="Label02" color="$onSurface-text-subdued">
                      BNS Name looks good
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
          Finalize
        </Button>
      </Flex>
    </Stack>
  );
};
