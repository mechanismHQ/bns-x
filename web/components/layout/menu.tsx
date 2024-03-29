import React, { useMemo } from 'react';
import { DropdownMenu, PopoverOption } from '@components/account-menu';
import { BoxLink } from '@components/link';
import { Stack, Box } from '@nelson-ui/react';
import { stxAddressAtom, useAuthState } from '@store/micro-stacks';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';
import { ONLY_INSCRIPTIONS } from '@common/constants';
import { Text } from '@components/text';
import { useRouter } from 'next/router';
import { usePunycode } from '@common/hooks/use-punycode';
import { useAtomValue } from 'jotai';
import { userNameState } from '@store/names';
import { useGradient } from '@common/hooks/use-gradient';
import { useAccountPath } from '@common/hooks/use-account-path';
import { styled } from '@common/theme';
import { useAddAccount } from '@common/hooks/use-add-account';
import { User, Users, UserPlus, LogOut } from 'lucide-react';
import { useTruncateEnd } from '@common/hooks/use-truncate-end';

export const Dropdown: React.FC = () => {
  const { signOut } = useAuthState();
  const { addAccount } = useAddAccount();
  const router = useRouter();

  return (
    <>
      {!ONLY_INSCRIPTIONS && (
        <>
          <BoxLink href={{ pathname: '/profile', query: { redirect: 'false' } }}>
            <PopoverOption Icon={User}>Names</PopoverOption>
          </BoxLink>
          <BoxLink href="/accounts">
            <PopoverOption Icon={Users}>Accounts</PopoverOption>
          </BoxLink>
          <PopoverOption
            Icon={UserPlus}
            onClick={async () => {
              await addAccount(async address => {
                await router.push({
                  pathname: '/accounts/[address]',
                  query: { address },
                });
              });
            }}
          >
            Add account
          </PopoverOption>
        </>
      )}

      <PopoverOption Icon={LogOut} onClick={async () => await signOut()}>
        Sign out
      </PopoverOption>
    </>
  );
};

const StyledName = styled(Text, {
  display: 'block',
  '@bp1': {
    display: 'none',
  },
});

export const Menu: React.FC = () => {
  const name = useAtomValue(userNameState);
  const nameDisplay = usePunycode(name);
  const stxAddress = useAtomValue(stxAddressAtom);
  const gradient = useGradient(name || stxAddress || '');
  const router = useRouter();
  const profilePath = useAccountPath('/profile');

  const display = useTruncateEnd(nameDisplay ?? stxAddress ?? '', 20);

  return (
    <DropdownMenu
      onClick={async () => {
        const pathname = ONLY_INSCRIPTIONS ? '/' : profilePath;
        await router.push(pathname);
      }}
      popover={<Dropdown />}
    >
      <Stack isInline alignItems={'center'} spacing="8px">
        <Box borderRadius="50%" size="32px" background={gradient} />
        <StyledName variant="Label01">{display}</StyledName>
      </Stack>
    </DropdownMenu>
  );
};
