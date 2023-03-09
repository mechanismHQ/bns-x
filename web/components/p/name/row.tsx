import React from 'react';
import { Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
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

export const LeftBar = styled(Stack, {
  maxWidth: '388px',
  '@bp1': {
    maxWidth: 'none',
    width: '100% !important',
  },
});

export const RightBar = styled(Stack, {
  width: '620px',
  '@bp1': {
    width: '100% !important',
  },
});

export const PageContainer = styled(Stack, {
  flexDirection: 'row',
  '@bp2': {
    flexDirection: 'row',
  },
  '@bp1': {
    flexDirection: 'column !important',
  },
});

export const RecordValueMobile = styled(Box, {
  '@bp2': {
    display: 'none',
  },
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
  '@bp1': {
    flexGrow: 'unset',
    height: '80px',
  },
});

export const AddressGroup: React.FC<{ children: string }> = ({ children }) => {
  return (
    <Stack isInline spacing="17px" alignItems={'center'} py="6px" pb="4px">
      <RecordValueMobile>
        <Text variant={'Label02'}>{truncateMiddle(children)}</Text>
      </RecordValueMobile>
      <RecordValueDesktop>
        <Text variant={'Label02'}>{children}</Text>
      </RecordValueDesktop>

      <DuplicateIcon clipboardText={children} />
      <LockedIcon />
      <PencilIcon />
    </Stack>
  );
};

export const AddMeHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Stack isInline alignItems={'center'} spacing="5px">
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

export const InputGroup: React.FC<{ children?: React.ReactNode }> = () => {
  return (
    <Stack spacing="10px" pt="12px" alignItems={'baseline'} width="100%">
      <Input placeholder="Enter a Bitcoin Address" width="100%" />
      <Stack isInline spacing="$3" alignItems="center">
        <ErrorIcon fill="var(--colors-light-critical-text-critical)" />
        <Text variant="Label02" color="$light-critical-text-critical">
          Invalid BNS name
        </Text>
      </Stack>
      <Stack isInline spacing="$3" alignItems="center">
        <CheckLightIcon />
        <Text variant="Label02" color="$onSurface-text-subdued">
          BNS Name looks good
        </Text>
      </Stack>
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
