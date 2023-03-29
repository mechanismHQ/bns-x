import React, { Suspense, useMemo } from 'react';
import { Box, Stack, Flex } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { addressDisplayNameState } from '@store/api';
import type { Account } from '@store/micro-stacks';
import { currentAccountAtom, stxAddressAtom } from '@store/micro-stacks';
import { useGradient } from '@common/hooks/use-gradient';
import { truncateMiddle } from '@common/utils';

export const AccountRow: React.FC<{ account: Account }> = ({ account }) => {
  return (
    <Suspense fallback={<Box width="100%" height="0px" />}>
      <LoadedAccountRow account={account} />
    </Suspense>
  );
};

export const LoadedAccountRow: React.FC<{ account: Account }> = ({ account }) => {
  const name = useAtomValue(addressDisplayNameState(account.stxAddress));
  const gradient = useGradient(name || account.stxAddress);
  const currentAccount = useAtomValue(stxAddressAtom);
  const primaryDisplay = useMemo(() => {
    if (name !== null) return name;
    return truncateMiddle(account.stxAddress, 6);
  }, [account.stxAddress, name]);

  if (currentAccount === account.stxAddress) return null;

  return (
    <Stack isInline alignItems="center" spacing="10px">
      <Box size="30px" borderRadius="50%" background={gradient} />
      <Stack alignItems={'center'}>
        <Text variant="Label01">{primaryDisplay}</Text>
      </Stack>
    </Stack>
  );
};
