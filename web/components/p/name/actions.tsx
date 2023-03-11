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
} from '@store/profile';
import { Button } from '@components/button';
import { LinkInner } from '@components/link';

export const ProfileActions: React.FC = () => {
  const isEditing = useAtomValue(isEditingProfileAtom);
  const formState = useAtomValue(profileFormValidAtom);

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

  const submit = useAtomCallback(
    useCallback((get, set) => {
      const formState = get(profileFormValidAtom);
      if (!formState.canSubmit) return;
      const editedZonefile = get(editedZonefileState);
      console.log(editedZonefile);
    }, [])
  );

  if (!isEditing) return null;

  return (
    <Stack isInline py="40px" spacing="30px" alignItems="center">
      <Button disabled={formState.canSubmit} width="154px" onClick={submit}>
        Save
      </Button>
      <LinkInner plain variant="Label01" onClick={cancelEdit} color="$text-subdued">
        Cancel
      </LinkInner>
    </Stack>
  );
};
