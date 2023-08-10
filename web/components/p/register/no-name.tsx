import React from 'react';
import { currentUserAddressNameStringsState } from '@store/names';
import { useAtomValue } from 'jotai';
import { Button } from '@components/ui/button';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';
import { Link } from '@components/link';

export const RegisterNoName: React.FC<{ children?: React.ReactNode }> = () => {
  const { switchAccounts } = useSwitchAccounts();
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const v1Name = allNames.coreName;
  return (
    <div className="space-y-5 text-center">
      <div className="flex flex-col gap-10 items-center">
        <div>
          <h1 className="text-gray-200 text-7xl font-open-sauce-one font-medium tracking-normal leading-10 max-w-lg">
            Register your BNS name
          </h1>
        </div>
        <p className="text-gray-200 text-sm font-inter font-normal tracking-normal leading-6 max-w-lg">
          Looks like you registered {v1Name} for this account. Switch to an account that
          doesn&apos;t own any names, or <Link href="/upgrade">migrate your name to BNSx</Link>.
        </p>
        <Button className="w-60 text-md" size="lg" onClick={() => switchAccounts()}>
          Switch accounts
        </Button>
      </div>
    </div>
  );
};
