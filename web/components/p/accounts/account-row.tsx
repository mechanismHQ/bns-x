import React, { Suspense, useMemo } from 'react';
import { Box, Stack, Flex, SpaceBetween } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { addressDisplayNameState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { primaryAccountState } from '@store/micro-stacks';
import { useGradient } from '@common/hooks/use-gradient';
import { truncateMiddle } from '@common/utils';
import { AccountProgress, accountProgressAtom, accountProgressStatusState } from '@store/accounts';
import { LinkText } from '@components/link';
import { usePunycode } from '@common/hooks/use-punycode';
import { loadable, waitForAll } from 'jotai/utils';
import { useTruncateEnd } from '@common/hooks/use-truncate-end';
import { AccountActions } from './account-actions';
import { Loader2 } from 'lucide-react';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { useMonitorProgress } from '@common/hooks/use-monitor-progress';

export const LoadingRow: React.FC<{ children?: React.ReactNode; account: Account }> = ({
  account,
}) => {
  return (
    <div className="flex gap-[10px]">
      <div className="w-[50px] h-[50px] rounded-full bg-gray-200 animate-pulse" />
      <div className="flex flex-col justify-center">
        <div className="flex flex-row items-center">
          <Text variant="Label02">Account {account.index + 1}</Text>
          <Loader2 className="animate-spin h-4 text-gray-400 ml-1" aria-label="Loading" />
        </div>
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
  const loadableName = useAtomValue(loadable(addressDisplayNameState(account.stxAddress)));
  const progress = useAtomValue(accountProgressAtom(account.stxAddress));
  const name = useDeepMemo(() => {
    if (loadableName.state === 'hasData') return loadableName.data;
    return progress.name ?? null;
  }, [loadableName, progress]);
  useMonitorProgress(account.stxAddress);
  const status = useAtomValue(loadable(accountProgressStatusState(account.stxAddress)));
  const gradient = useGradient(name || account.stxAddress);
  const addressTruncated = useMemo(() => {
    return truncateMiddle(account.stxAddress, 4);
  }, [account.stxAddress]);

  const primaryDisplayName = useMemo(() => {
    if (name) return name;
    return `Account ${account.index + 1}`;
  }, [name, account.index]);
  const primaryDisplay = usePunycode(primaryDisplayName);
  const displayTruncated = useTruncateEnd(primaryDisplay, 15);

  const isPending = useMemo(() => {
    if (status.state !== 'hasData') return true;
    return (
      status.data === AccountProgress.FinalizePending ||
      status.data === AccountProgress.WrapperDeployPending
    );
  }, [status]);

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
        <Suspense
          fallback={<Loader2 className="animate-spin h-4 w-4" color="var(--colors-text)" />}
        >
          {isPending && <Loader2 className="animate-spin h-4 w-4" color="var(--colors-text)" />}
          <AccountActions account={account} />
        </Suspense>
      </Stack>
    </SpaceBetween>
  );
};
