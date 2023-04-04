import React, { useMemo } from 'react';
import { DropdownMenu, PopoverOption } from '@components/dropdown-menu';
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

export const Dropdown: React.FC = () => {
  const { signOut } = useAuthState();
  const { switchAccounts } = useSwitchAccounts();
  const router = useRouter();
  const profilePath = useAccountPath('/profile');

  return (
    <>
      {!ONLY_INSCRIPTIONS && (
        <BoxLink href={{ pathname: '/profile', query: { redirect: 'false' } }}>
          <PopoverOption>View all names</PopoverOption>
        </BoxLink>
      )}
      <PopoverOption
        onClick={async () => {
          await switchAccounts(async () => {
            const pathname = ONLY_INSCRIPTIONS ? '/' : profilePath;
            await router.push(pathname);
          });
        }}
      >
        Switch accounts
      </PopoverOption>
      <BoxLink href="/accounts">
        <PopoverOption>Accounts</PopoverOption>
      </BoxLink>
      <PopoverOption onClick={async () => await signOut()}>Sign out</PopoverOption>
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

  const display = useMemo(() => {
    const show = nameDisplay || stxAddress || '';
    const MAX_NAME = 20;
    if (show.length > MAX_NAME) {
      return show.slice(0, MAX_NAME - 3) + '...';
    }
    return show;
  }, [nameDisplay, stxAddress]);

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
