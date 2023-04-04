import React, { Suspense, useMemo } from 'react';
import { Box, Stack, Flex, SpaceBetween } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { addressDisplayNameState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { currentAccountAtom, stxAddressAtom } from '@store/micro-stacks';
import { useGradient } from '@common/hooks/use-gradient';
import { truncateMiddle } from '@common/utils';
import { AccountProgress, accountProgressAtom, accountProgressStatusState } from '@store/accounts';
import type { ProgressProps } from '@components/progress-bar';
import { ProgressBar } from '@components/progress-bar';
import { BoxLink, LinkText } from '@components/link';
import { DropdownMenu, PopoverOption } from '@components/dropdown-menu';
import { usePunycode } from '@common/hooks/use-punycode';

export const AccountRow: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <Suspense fallback={<Box width="100%" height="0px" />}>
      <LoadedAccountRow account={account} />
    </Suspense>
  );
};

export const AccountActions: React.FC<{ account: Account }> = ({ account }) => {
  const pathBase = '/accounts/[address]';
  const query = { address: account.stxAddress };
  return (
    <DropdownMenu
      popover={
        <>
          <BoxLink href={{ pathname: `${pathBase}/upgrade`, query }}>
            <PopoverOption>Migrate</PopoverOption>
          </BoxLink>
          <BoxLink href={{ pathname: pathBase, query }}>
            <PopoverOption>View account</PopoverOption>
          </BoxLink>
        </>
      }
    >
      Actions
    </DropdownMenu>
  );
};

export const LoadedAccountRow: React.FC<{ account: Account }> = ({ account }) => {
  const name = useAtomValue(addressDisplayNameState(account.stxAddress));
  const progress = useAtomValue(accountProgressAtom(account.stxAddress));
  const status = useAtomValue(accountProgressStatusState(account.stxAddress));
  const gradient = useGradient(name || account.stxAddress);
  const currentAccount = useAtomValue(stxAddressAtom);
  const addressTruncated = useMemo(() => {
    return truncateMiddle(account.stxAddress, 4);
  }, [account.stxAddress]);
  const primaryDisplayName = useMemo(() => {
    if (progress.name) return progress.name;
    if (name !== null) return name;
    return 'No BNS name';
  }, [progress.name, name]);
  const primaryDisplay = usePunycode(primaryDisplayName);

  const progressProps: ProgressProps = useMemo(() => {
    switch (status) {
      case AccountProgress.NotStarted:
        return { value: 5, pending: false };
      case AccountProgress.Done:
        return { value: 100, pending: false };
      case AccountProgress.WrapperDeployPending:
        return { value: 45, pending: true };
      case AccountProgress.WrapperDeployed:
        return { value: 50, pending: false };
      case AccountProgress.FinalizePending:
        return { value: 95, pending: true };
      case AccountProgress.Done:
        return { value: 100, pending: false };
      case AccountProgress.NoName:
        return { value: 100, pending: false };
    }
  }, [status]);

  if (currentAccount === account.stxAddress) return null;

  return (
    <SpaceBetween isInline>
      <Stack isInline alignItems="center" spacing="10px">
        <Box size="50px" borderRadius="50%" background={gradient} />
        <Stack py="4px" spacing="1px">
          <Text variant="Label02">{primaryDisplay}</Text>
          <Flex>
            <LinkText
              href={`https://explorer.stacks.co/address/${account.stxAddress ?? ''}`}
              target="_blank"
              variant="Body02"
              color={'$onSurface-text-subdued'}
            >
              {addressTruncated}
            </LinkText>
          </Flex>
        </Stack>
      </Stack>
      <Box flexGrow={1} />
      <Stack isInline alignItems="center" spacing="20px" flexGrow={1}>
        <Box maxWidth="400px" flexGrow={1}>
          <ProgressBar {...progressProps} />
        </Box>
        <AccountActions account={account} />
      </Stack>
    </SpaceBetween>
  );
};
