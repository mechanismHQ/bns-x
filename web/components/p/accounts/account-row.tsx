import React, { Suspense, memo, useMemo } from 'react';
import { Box, Stack, Flex, SpaceBetween } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { addressDisplayNameState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { primaryAccountState } from '@store/micro-stacks';
import { useGradient } from '@common/hooks/use-gradient';
import { truncateMiddle } from '@common/utils';
import { AccountProgress, accountProgressAtom, accountProgressStatusState } from '@store/accounts';
import type { ProgressProps } from '@components/progress-bar';
import { ProgressBar } from '@components/progress-bar';
import { BoxLink, LinkText } from '@components/link';
import { DropdownMenu, PopoverOption } from '@components/dropdown-menu';
import { usePunycode } from '@common/hooks/use-punycode';
import { useSetPrimaryAccount } from '@common/hooks/use-set-primary-account';
import { waitForAll } from 'jotai/utils';
import { useRemoveAccount } from '@common/hooks/use-remove-account';
import { useTruncateEnd } from '@common/hooks/use-truncate-end';

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
  const { setPrimary } = useSetPrimaryAccount();
  const { removeAccount } = useRemoveAccount();
  const status = useAtomValue(accountProgressStatusState(account.stxAddress));

  const migrateOptionMessage = useMemo(() => {
    switch (status) {
      case AccountProgress.NoName:
        return null;
      case AccountProgress.NotStarted:
        return 'Migrate to BNSx';
      case AccountProgress.Done:
        return 'View migration';
    }
    return 'Continue migration';
  }, [status]);

  return (
    <DropdownMenu
      popover={
        <>
          {migrateOptionMessage !== null && (
            <BoxLink href={{ pathname: `${pathBase}/upgrade`, query }}>
              <PopoverOption>{migrateOptionMessage}</PopoverOption>
            </BoxLink>
          )}
          <BoxLink href={{ pathname: pathBase, query }}>
            <PopoverOption>Manage names</PopoverOption>
          </BoxLink>
          <PopoverOption
            onClick={async () => {
              await setPrimary(account.index);
            }}
          >
            Set as primary
          </PopoverOption>
          <PopoverOption
            onClick={async () => {
              await removeAccount(account);
            }}
          >
            Remove account
          </PopoverOption>
        </>
      }
    >
      Actions
    </DropdownMenu>
  );
};

export const LoadedAccountRow: React.FC<{ account: Account }> = ({ account }) => {
  const [name, progress] = useAtomValue(
    waitForAll([
      addressDisplayNameState(account.stxAddress),
      accountProgressAtom(account.stxAddress),
    ])
  );
  const status = useAtomValue(accountProgressStatusState(account.stxAddress));
  const gradient = useGradient(name || account.stxAddress);
  const primaryAccount = useAtomValue(primaryAccountState);
  const addressTruncated = useMemo(() => {
    return truncateMiddle(account.stxAddress, 4);
  }, [account.stxAddress]);
  const primaryDisplayName = useMemo(() => {
    if (progress.name) return progress.name;
    if (name !== null) return name;
    return `Account ${account.index + 1}`;
  }, [progress.name, name, account.index]);
  const primaryDisplay = usePunycode(primaryDisplayName);
  const displayTruncated = useTruncateEnd(primaryDisplay, 15);

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

  if (primaryAccount?.stxAddress === account.stxAddress) return null;

  return (
    <SpaceBetween isInline>
      <Stack isInline alignItems="center" spacing="10px">
        <Box size="50px" borderRadius="50%" background={gradient} className="hidden md:block" />
        <Stack py="4px" spacing="1px">
          <Text variant="Label02">
            <span className="inline md:hidden">{displayTruncated}</span>
            <span className="hidden md:inline">{primaryDisplay}</span>
          </Text>
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
          {status !== AccountProgress.NoName && <ProgressBar {...progressProps} />}
        </Box>

        <AccountActions account={account} />
      </Stack>
    </SpaceBetween>
  );
};
