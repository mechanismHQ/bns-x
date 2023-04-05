import React, { useCallback, useEffect, useMemo } from 'react';
import { Box, Stack, Flex, SpaceBetween } from '@nelson-ui/react';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { primaryNameState, userNameState } from '@store/names';
import { usePunycode } from '@common/hooks/use-punycode';
import {
  accountsAtom,
  cleanAccountsAtom,
  clientState,
  primaryAccountState,
  stxAddressAtom,
} from '@store/micro-stacks';
import { truncateMiddle } from '@common/utils';
import { useGradient } from '@common/hooks/use-gradient';
import { Button } from '@components/button';
import { Link } from '@components/link';
import { useAddAccount } from '@common/hooks/use-add-account';
import { AccountRow } from '@components/p/accounts/account';
import { Toggle } from '@components/ui/toggle';
import { RESET, useAtomCallback } from 'jotai/utils';
import type { AccountProgressData } from '@store/accounts';
import { accountProgressAtom, accountProgressStorageAtom } from '@store/accounts';
import { networkKeyAtom } from '@store/index';

export const Accounts: React.FC<{ children?: React.ReactNode }> = () => {
  const primaryAccount = useAtomValue(primaryAccountState);
  const displayName = useAtomValue(primaryNameState);
  const nameDisplay = usePunycode(displayName);
  const { stxAddress } = primaryAccount ?? {};
  const gradient = useGradient(displayName || stxAddress || '');
  const { addAccount } = useAddAccount();
  const accounts = useAtomValue(cleanAccountsAtom);
  const networkKey = useAtomValue(networkKeyAtom);

  const primaryDisplay = useMemo(() => {
    if (nameDisplay !== null) return nameDisplay;
    if (stxAddress) return truncateMiddle(stxAddress, 6);
    return '';
  }, [nameDisplay, stxAddress]);

  const accountRows = useMemo(() => {
    return accounts.map(account => (
      <AccountRow key={account.address.join('-')} account={account} />
    ));
  }, [accounts]);

  const removeAllProgress = useAtomCallback(
    useCallback((get, set) => {
      const accounts = get(cleanAccountsAtom);

      accounts.forEach(account => {
        set(
          accountProgressStorageAtom(account.stxAddress),
          RESET as unknown as AccountProgressData
        );
      });
    }, [])
  );

  return (
    <Stack width="100%" px="29px">
      <Text variant="Heading035">Accounts</Text>
      <SpaceBetween isInline alignItems="center">
        <Stack isInline>
          <Box
            borderRadius="50%"
            aspectRatio="1"
            width="80px"
            height="80px"
            backgroundImage={gradient}
          />
          <Stack spacing="8px" justifyContent={'center'}>
            <Text variant="Label01">{primaryDisplay}</Text>
            <Text variant="Caption01">Primary Account</Text>
          </Stack>
        </Stack>
        <Button>Change</Button>
      </SpaceBetween>
      <SpaceBetween isInline alignItems="center">
        <Text variant="Heading04">In Progress:</Text>
        <Button
          secondary
          onClick={async () => {
            await addAccount();
          }}
        >
          Add Account
        </Button>
      </SpaceBetween>
      <Text variant="Body02" color="$text-dim">
        Manage upgrading multiple accounts simultaneously by connecting new accounts.{' '}
        <Link href="#" display="inline-block">
          Learn more
        </Link>{' '}
      </Text>
      {networkKey === 'devnet' && (
        <Box cursor="pointer">
          <Text variant="Caption02">
            <code onClick={removeAllProgress}>reset all</code>
          </Text>
        </Box>
      )}
      <Box height="10px" />
      {accountRows}
    </Stack>
  );
};
