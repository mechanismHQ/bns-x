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
import { DropdownMenu, PopoverOption } from '@components/account-menu';
import { usePunycode } from '@common/hooks/use-punycode';
import { useSetPrimaryAccount } from '@common/hooks/use-set-primary-account';
import { waitForAll } from 'jotai/utils';
import { useRemoveAccount } from '@common/hooks/use-remove-account';
import { useTruncateEnd } from '@common/hooks/use-truncate-end';
import { Beutton } from '@components/ui/beutton';
import { AccountActions } from './account-actions';
import { Loader2 } from 'lucide-react';

export const LoadingRow: React.FC<{ children?: React.ReactNode; account: Account }> = ({
  account,
}) => {
  return (
    <div className="flex gap-[10px]">
      <div className="w-[50px] h-[50px] rounded-full bg-gray-200 animate-pulse" />
      <div className="flex flex-col justify-center">
        <Text variant="Label02">Account {account.index + 1}</Text>
        <div className="flex">
          <LinkText
            href={`https://explorer.stacks.co/address/${account.stxAddress ?? ''}`}
            target="_blank"
            variant="Body02"
            color={'$onSurface-text-subdued'}
          >
            {truncateMiddle(account.stxAddress ?? '', 4)}
          </LinkText>
        </div>
      </div>
    </div>
  );
};

export const AccountRow: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <Suspense fallback={<LoadingRow account={account} />}>
      {/* <LoadingRow account={account} /> */}
      <LoadedAccountRow account={account} />
    </Suspense>
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

  const isPending = useMemo(() => {
    return (
      status === AccountProgress.FinalizePending || status === AccountProgress.WrapperDeployPending
    );
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
      {/* <Box flexGrow={1} /> */}
      <Stack isInline alignItems="center" spacing="20px">
        {isPending && <Loader2 className="animate-spin h-4 w-4" color="var(--colors-text)" />}
        <AccountActions account={account} />
      </Stack>
    </SpaceBetween>
  );
};
