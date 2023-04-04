import React, { Suspense, useMemo } from 'react';
import { Box, Stack, Flex, SpaceBetween } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { addressDisplayNameState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { currentAccountAtom, stxAddressAtom } from '@store/micro-stacks';
import { useGradient } from '@common/hooks/use-gradient';
import { truncateMiddle } from '@common/utils';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { AccountProgress, accountProgressAtom, accountProgressStatusState } from '@store/accounts';
import type { ProgressProps } from '@components/progress-bar';
import { ProgressBar } from '@components/progress-bar';
import { LinkText } from '@components/link';

export const AccountRow: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <Suspense fallback={<Box width="100%" height="0px" />}>
      <LoadedAccountRow account={account} />
    </Suspense>
  );
};

export const LoadedAccountRow: React.FC<{ account: Account }> = ({ account }) => {
  const name = useAtomValue(addressDisplayNameState(account.stxAddress));
  const progress = useAtomValue(accountProgressAtom(account.stxAddress));
  const status = useAtomValue(accountProgressStatusState(account.stxAddress));
  const router = useRouter();
  const gradient = useGradient(name || account.stxAddress);
  const currentAccount = useAtomValue(stxAddressAtom);
  const addressTruncated = useMemo(() => {
    return truncateMiddle(account.stxAddress, 4);
  }, [account.stxAddress]);
  const primaryDisplay = useMemo(() => {
    if (progress.name) return progress.name;
    if (name !== null) return name;
    return truncateMiddle(account.stxAddress, 6);
  }, [account.stxAddress, progress.name, name]);

  const progressProps: ProgressProps = useMemo(() => {
    switch (status) {
      case AccountProgress.NotStarted:
        return { value: 3, pending: false };
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
      <Stack isInline alignItems="center" spacing="10px" flexGrow={1}>
        <Box maxWidth="400px" flexGrow={1}>
          <ProgressBar {...progressProps} />
        </Box>
        <Button
          secondary
          onClick={async () => {
            await router.push({
              pathname: `/accounts/[address]`,
              query: { address: account.stxAddress },
            });
          }}
        >
          Manage
        </Button>
      </Stack>
    </SpaceBetween>
  );
};
