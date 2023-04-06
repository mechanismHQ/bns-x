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
  secondaryAccountsAtom,
  stxAddressAtom,
} from '@store/micro-stacks';
import { truncateMiddle } from '@common/utils';
import { useGradient } from '@common/hooks/use-gradient';
import { Button } from '@components/button';
import { Link } from '@components/link';
import { useAddAccount } from '@common/hooks/use-add-account';
import { AccountRow } from '@components/p/accounts/account-row';
import { Toggle } from '@components/ui/toggle';
import { RESET, useAtomCallback } from 'jotai/utils';
import type { AccountProgressData } from '@store/accounts';
import { accountProgressAtom, accountProgressStorageAtom } from '@store/accounts';
import { networkKeyAtom } from '@store/index';
import { Divider } from '@components/upgrade/rows';

export const AccountsList: React.FC<{ children?: React.ReactNode }> = () => {
  const primaryAccount = useAtomValue(primaryAccountState);
  const displayName = useAtomValue(primaryNameState);
  const nameDisplay = usePunycode(displayName);
  const { stxAddress } = primaryAccount ?? {};
  const gradient = useGradient(displayName || stxAddress || '');
  const { addAccount } = useAddAccount();
  const accounts = useAtomValue(secondaryAccountsAtom);
  const networkKey = useAtomValue(networkKeyAtom);

  const primaryDisplay = useMemo(() => {
    if (nameDisplay !== null) return nameDisplay;
    if (stxAddress) return truncateMiddle(stxAddress, 6);
    return '';
  }, [nameDisplay, stxAddress]);

  const accountRows = useMemo(() => {
    return accounts.map(account => (
      <React.Fragment key={account.stxAddress}>
        <Divider />
        <AccountRow key={account.address.join('-')} account={account} />
      </React.Fragment>
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
    <Stack width="100%" px="29px" spacing="25px">
      <div className="flex flex-wrap flex-col gap-0">
        <Text variant="Heading035">Accounts</Text>
        <Text variant="Body02" color="$text-dim">
          Manage upgrading multiple accounts simultaneously by connecting new accounts.{' '}
          <Link
            href="https://docs.bns.xyz/dots/migrating-multiple-accounts"
            target="_blank"
            display="inline-block"
          >
            Learn more
          </Link>{' '}
        </Text>
      </div>

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
      </SpaceBetween>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <Text variant="Heading05">Secondary accounts</Text>
        <Button
          className="w-full md:w-auto"
          // secondary
          onClick={async () => {
            await addAccount();
          }}
        >
          Add Account
        </Button>
      </div>
      <Stack spacing="25px">
        {accountRows}
        {accounts.length > 0 && <Divider />}
      </Stack>
      {networkKey === 'devnet' && (
        <Box cursor="pointer">
          <Text variant="Caption02" color="$text-very-dim">
            <code onClick={removeAllProgress}>reset all</code>
          </Text>
        </Box>
      )}
    </Stack>
  );
};
