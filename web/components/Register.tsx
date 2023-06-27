import React, { useMemo } from 'react';
import { NAMESPACES } from '@bns-x/core';
import { Box } from '@nelson-ui/react';
import { Input } from '@components/ui/input';
import { currentUserAddressNameStringsState, availableNamespacesState } from '@store/names';
import { useAtomValue } from 'jotai';
import { Button } from '@components/ui/button';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';
import { BnsNameRow } from '@components/bns-name-row';
import { Toaster } from 'sonner';

const Border: React.FC = () => {
  return (
    <div className="flex items-center w-full px-29 min-w-0">
      <Box width="100%" height="1px" borderTop="1px solid $onSurface-border-subdued" />
    </div>
  );
};

export const Register: React.FC<{ children?: React.ReactNode }> = () => {
  const { switchAccounts } = useSwitchAccounts();
  const [bnsName, setBnsName] = React.useState('');
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const availableNamespaces = useAtomValue(availableNamespacesState);
  const v1Name = allNames.coreName;
  const availableNames = availableNamespaces.map(namespace => ({ name: bnsName, namespace }));

  const rows = useMemo(() => {
    return (
      availableNames?.map((nameDetails: { name: string; namespace: string }) => {
        return (
          <Box key={`name-${nameDetails.namespace}`}>
            <BnsNameRow {...nameDetails} />
            <Border />
          </Box>
        );
      }) ?? null
    );
  }, [bnsName]);

  const noNames = useMemo(() => {
    return allNames.coreName === null && allNames.bnsxNames.length === 0;
  }, [allNames.coreName, allNames.bnsxNames.length]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setBnsName(event.target.value);
  }

  return (
    <>
      <Box flexGrow={1} />
      <div className="w-full space-y-6">
        {noNames ? (
          <>
            <div className="space-y-10 text-center">
              <h1 className="text-gray-200 text-7xl font-open-sauce-one font-medium tracking-normal leading-10">
                Claim your BNS
              </h1>
              <div className="flex w-full max-w-xl mx-auto items-center space-x-3">
                <div className="w-full relative">
                  <Input
                    className="h-12 text-md"
                    type="text"
                    placeholder="Claim your BNS"
                    value={bnsName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            {rows}
          </>
        ) : (
          <div className="space-y-5 text-center">
            <div className="space-y-6">
              <h1 className="text-gray-200 text-7xl font-open-sauce-one font-medium tracking-normal leading-10">
                Claim your BNS
              </h1>
              <p className="text-gray-200 text-sm font-inter font-normal tracking-normal leading-6">
                Looks like you registered {v1Name} for this account. Switch to an account that
                doesn't own any BNS or BNSx names.
              </p>
            </div>
            <Button className="w-60 text-md" size="lg" onClick={() => switchAccounts()}>
              Switch accounts
            </Button>
          </div>
        )}
      </div>
      <Box flexGrow={1} />
      <Toaster theme="dark" closeButton />
    </>
  );
};
