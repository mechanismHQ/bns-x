import React, { useCallback } from 'react';
import { Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtom, useAtomValue } from 'jotai';
import { stxAddressAtom } from '@store/micro-stacks';
import { DuplicateIcon } from '@components/icons/duplicate';
import { LockIcon } from '@components/icons/lock';
import { PencilIcon } from '@components/icons/pencil';
import { PlusIcon } from '@components/icons/plus';
import { Input } from '@components/form';
import { ErrorIcon } from '@components/icons/error';
import { CheckIcon, CheckLightIcon } from '@components/icons/check';
import { TooltipTippy } from '@components/tooltip';
import { styled } from '@common/theme';
import { truncateMiddle } from '@common/utils';
import type { ZonefileFieldAtom } from '@store/profile';
import { nameUpdateTxidConfirmedAtom } from '@store/profile';
import { nameUpdateTxidAtom } from '@store/profile';
import { isEditingProfileAtom } from '@store/profile';
import { useInput } from '@common/hooks/use-input';
import { useAtomCallback, useUpdateAtom } from 'jotai/utils';

export function useSetEditing() {
  return useAtomCallback(
    useCallback((get, set) => {
      set(isEditingProfileAtom, true);
    }, [])
  );
}

export const LeftBar = styled(Stack, {
  flexBasis: '300px',
});

export const RightBar = styled(Stack, {
  flexBasis: '450px',
  flexGrow: 3,
  maxWidth: '100%',
});

export const PageContainer = styled(Stack, {
  flexWrap: 'wrap',
  gap: '70px 30px !important',
  '@bp2': {
    flexDirection: 'column !important',
  },
});

export const RecordValueMobile = styled(Box, {
  display: 'none',
  '@bp1': {
    display: 'block !important',
  },
});

export const RecordValueDesktop = styled(Box, {
  '@bp2': {
    display: 'block',
  },
  '@bp1': {
    display: 'none',
  },
});

export const ElementGap = styled(Box, {
  flexGrow: 1,
  maxWidth: '50px',
  '@bp2': {
    display: 'none',
  },
});

export const EditableAddressGroup: React.FC<{ atom: ZonefileFieldAtom }> = ({ atom }) => {
  const value = useAtomValue(atom.value);
  const nameUpdateTxid = useAtomValue(nameUpdateTxidAtom);
  const updateFinishedTxid = useAtomValue(nameUpdateTxidConfirmedAtom);
  const isEditing = useAtomValue(isEditingProfileAtom);

  if (
    isEditing &&
    typeof nameUpdateTxid === 'undefined' &&
    typeof updateFinishedTxid === 'undefined'
  ) {
    return <InputGroup inputAtom={atom} />;
  }

  return <AddressGroup>{value}</AddressGroup>;
};

export const AddressGroup: React.FC<{ children: string; editable?: boolean }> = ({
  children,
  editable = true,
}) => {
  const setEditing = useSetEditing();
  if (children.length === 0) return null;
  return (
    <Stack isInline spacing="17px" alignItems={'center'} py="6px" pb="4px">
      <RecordValueMobile>
        <Text variant={'Label02'}>
          {children.length < 40 ? children : truncateMiddle(children, 6)}
          {/* {truncateMiddle(children, 6)} */}
        </Text>
      </RecordValueMobile>
      <RecordValueDesktop>
        <Text variant={'Label02'}>{children}</Text>
      </RecordValueDesktop>
      <DuplicateIcon clipboardText={children} />
      {editable && <PencilIcon onClick={setEditing} cursor="pointer" />}
      {!editable && <LockedIcon />}
    </Stack>
  );
};

export const AddMeHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setEditing = useSetEditing();
  return (
    <Stack isInline alignItems={'center'} spacing="5px" cursor="pointer" onClick={setEditing}>
      <PlusIcon />
      <Text variant="Label01">{children}</Text>
    </Stack>
  );
};

export const LockedIcon = () => {
  return (
    <TooltipTippy
      tippyProps={{
        trigger: 'mouseenter focus',
        followCursor: true,
        placement: 'bottom',
        hideOnClick: false,
      }}
      render={
        <Text variant="Caption01" color="$text">
          Cannot edit this field
        </Text>
      }
      containerProps={{
        padding: '12px 16px',
      }}
    >
      <Box>
        <LockIcon />
      </Box>
    </TooltipTippy>
  );
};

export const AddressHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Text variant="Label01" color="$text-subdued">
      {children}
    </Text>
  );
};

export const RowDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Text variant="Caption02" color="$text-subdued">
      {children}
    </Text>
  );
};

export const InputGroup: React.FC<{
  children?: React.ReactNode;
  inputAtom: ZonefileFieldAtom;
}> = ({ inputAtom }) => {
  const input = useInput(useAtom(inputAtom.value));
  const isValid = useAtomValue(inputAtom.valid);
  const name = inputAtom.name;
  return (
    <Stack spacing="10px" pt="12px" alignItems={'baseline'} width="100%">
      <Input placeholder={`Enter a ${name}`} width="100%" {...input.props} />
      {input.value.length > 0 && (
        <>
          {isValid ? (
            <Stack isInline spacing="$3" alignItems="center">
              <CheckLightIcon />
              <Text variant="Label02" color="$onSurface-text-subdued">
                {name} looks good
              </Text>
            </Stack>
          ) : (
            <Stack isInline spacing="$3" alignItems="center">
              <ErrorIcon fill="var(--colors-light-critical-text-critical)" />
              <Text variant="Label02" color="$light-critical-text-critical">
                Invalid {name}
              </Text>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
};

export const TitleBox: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Stack spacing="7px" alignItems={'baseline'}>
      {children}
    </Stack>
  );
};

export const Divider = () => {
  return <Box height="1px" borderTop="1px solid $onSurface-border-subdued" width="100%" />;
};

export const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Stack py="27px" spacing="12px" width="100%">
      {children}
    </Stack>
  );
};
