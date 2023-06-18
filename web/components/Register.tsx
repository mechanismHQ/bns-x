import React, { useCallback, useMemo } from 'react';
import { Stack, Box, Flex, SpaceBetween } from '@nelson-ui/react';
import { ClarigenClient, contractFactory } from '@clarigen/core';
import { asciiToBytes, hexToBytes, bytesToHex } from 'micro-stacks/common';
import { networkAtom } from '@store/micro-stacks';
import { Input } from '@components/ui/input';
import { Check, AlertCircle } from 'lucide-react';
import { currentUserAddressNameStringsState, namePriceState } from '@store/names';
import { useDebounce } from 'usehooks-ts';
import { Text } from './text';
import { useAtomValue } from 'jotai';
import { waitForAll } from 'jotai/utils';
import { useEffect } from 'react';
import { Button } from '@components/ui/button';
import { useRouter } from 'next/router';
import { useGradient } from '@common/hooks/use-gradient';
import { stxAddressAtom } from '@store/micro-stacks';
import { truncateMiddle } from '@common/utils';
import { BoxLink, Link, LinkText } from '@components/link';
import { styled } from '@common/theme';
import { usePunycode } from '@common/hooks/use-punycode';
import { useAccountPath } from '@common/hooks/use-account-path';
import { useOpenContractCall } from '@micro-stacks/react';
import { hashFqn, contracts } from '@bns-x/core';
import { PostConditionMode } from 'micro-stacks/transactions';
import { useSwitchAccounts } from '@common/hooks/use-switch-accounts';
import { BnsNameRow } from '@components/bns-name-row';

const StyledName = styled(Text, {
  // initial: {
  fontSize: '28px',
  lineHeight: '44px',
  // },
  '@bp1': {
    fontSize: '22px',
    lineHeight: '36px',
  },
});

const StyledEditBox = styled(Box, {
  display: 'block',
  '@bp1': {
    display: 'none',
  },
});

const StyledAvatar = styled(Box, {
  width: '86px',
  height: '86px',
});

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
  const v1Name = allNames.coreName;
  const availableNames = [
    {
      name: bnsName,
      namespace: 'btc',
    },
    {
      name: bnsName,
      namespace: 'satoshi',
    },
    {
      name: bnsName,
      namespace: 'stx',
    },
  ];

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
    </>
  );
};
