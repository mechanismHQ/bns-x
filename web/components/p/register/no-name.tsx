import React from 'react';
import { currentUserAddressNameStringsState } from '@store/names';
import { useAtomValue } from 'jotai';
import { Button } from '@components/ui/button';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';
import { Link } from '@components/link';
import { Text } from '@components/ui/text';

export const RegisterNoName: React.FC<{ children?: React.ReactNode }> = () => {
  const { switchAccounts } = useSwitchAccounts();
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const v1Name = allNames.coreName;
  return (
    <>
      <div className="flex-grow"></div>
      <div className="space-y-5 text-center">
        <div className="flex flex-col gap-10 items-center">
          <div className="max-w-lg">
            <Text variant="Display02">Register your BNS name</Text>
          </div>
          <Text variant="Body02" className="max-w-lg">
            Looks like you registered {v1Name} for this account. Switch to an account that
            doesn&apos;t own any names, or <Link href="/upgrade">migrate your name to BNSx</Link>.
          </Text>
          <Button className="w-60 text-md" size="lg" onClick={() => switchAccounts()}>
            Switch accounts
          </Button>
        </div>
      </div>
      <div className="flex-grow"></div>
    </>
  );
};
