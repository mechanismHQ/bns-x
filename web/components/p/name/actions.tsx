import React, { useCallback } from 'react';
import { Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import {
  zonefileBtcAtom,
  zonefileNostrAtom,
  zonefileRedirectAtom,
  isEditingProfileAtom,
  profileFormValidAtom,
  editedZonefileState,
  nameUpdateTxAtom,
  nameUpdateTxidAtom,
  zonefileUpdateConfirmedState,
  nameUpdateTxidConfirmedAtom,
} from '@store/profile';
import { Button } from '@components/button';
import { LinkInner } from '@components/link';
import { useNameUpdate } from '@common/hooks/use-name-update';
import { Spinner } from '@components/spinner';
import { ExternalTx } from '@components/icons/external-tx';
import { CheckIcon } from '@components/icons/check';
import { ErrorIcon } from '@components/icons/error';

export const ProfileActions: React.FC = () => {
  const isEditing = useAtomValue(isEditingProfileAtom);
  const formState = useAtomValue(profileFormValidAtom);
  const updateTxid = useAtomValue(nameUpdateTxidAtom);
  const updateTx = useAtomValue(nameUpdateTxAtom);
  const updateConfirmedTxid = useAtomValue(nameUpdateTxidConfirmedAtom);
  const { updateName, isRequestPending } = useNameUpdate();

  const cancelEdit = useAtomCallback(
    useCallback((get, set) => {
      set(zonefileBtcAtom.value, '');
      set(zonefileNostrAtom.value, '');
      set(zonefileRedirectAtom.value, '');
      set(zonefileBtcAtom.dirty, false);
      set(zonefileNostrAtom.dirty, false);
      set(zonefileRedirectAtom.dirty, false);
      set(isEditingProfileAtom, false);
    }, [])
  );

  if (typeof updateConfirmedTxid !== 'undefined') {
    return (
      <Stack isInline spacing="21px" py="40px" alignItems={'center'}>
        <CheckIcon />
        <Text variant="Label01">Your name update transaction was confirmed.</Text>
        <ExternalTx txId={updateConfirmedTxid} />
      </Stack>
    );
  }

  if (updateTx !== null || typeof updateTxid !== 'undefined') {
    if (updateTx?.tx_status === 'pending' || updateTx === null) {
      return (
        <Stack spacing="7px" py="40px">
          <Stack isInline spacing="21px" alignItems={'center'}>
            <Spinner />
            <Text variant="Label01" color="$text-dim">
              Your updates are pending
            </Text>
            <ExternalTx txId={updateTxid} />
          </Stack>
          <Text variant="Label01" color="$text-dim">
            Your zonefile will be updated after your transaction has at least one confirmation.
          </Text>
        </Stack>
      );
    }
    if (updateTx.tx_status === 'success' && updateTx.is_unanchored === true) {
      return (
        <Stack spacing="7px" py="40px">
          <Stack isInline spacing="21px" alignItems={'center'}>
            <Spinner />
            <Text variant="Label01" color="$text-dim">
              Your transaction was confirmed in a microblock
            </Text>
            <ExternalTx txId={updateTxid} />
          </Stack>
          <Text variant="Label01" color="$text-dim">
            Your zonefile will be updated after your transaction has at least one full confirmation.
          </Text>
        </Stack>
      );
    }
    if (updateTx.tx_status === 'success') {
      return (
        <Stack isInline spacing="21px" py="40px" alignItems={'center'}>
          <CheckIcon />
          <Text variant="Label01">Your name update was confirmed successfully.</Text>
          <ExternalTx txId={updateTxid} />
        </Stack>
      );
    }

    return (
      <Stack isInline spacing="21px" py="40px" alignItems={'center'}>
        <ErrorIcon fill="var(--colors-light-critical-text-critical)" />
        <Text variant="Label02" color="$light-critical-text-critical">
          There was an error with your transaction: <pre>{updateTx.tx_status}</pre>
        </Text>
        <ExternalTx txId={updateTxid} />
      </Stack>
    );
  }

  if (!isEditing) return null;

  return (
    <Stack isInline py="40px" spacing="30px" alignItems="center">
      <Button
        disabled={!formState.canSubmit || isRequestPending}
        width="154px"
        onClick={updateName}
      >
        {isRequestPending ? 'Pending...' : 'Save'}
      </Button>
      {!isRequestPending && (
        <LinkInner plain variant="Label01" onClick={cancelEdit} color="$text-subdued">
          Cancel
        </LinkInner>
      )}
    </Stack>
  );
};
