import React, { useCallback, useMemo } from 'react';
import { Stack, Box, Flex, SpaceBetween } from '@nelson-ui/react';
import { ClarigenClient, contractFactory } from '@clarigen/core';
import { asciiToBytes, hexToBytes, bytesToHex } from 'micro-stacks/common';
import { networkAtom } from '@store/micro-stacks';
import { Input } from '@components/ui/input';
import { Check, AlertCircle } from 'lucide-react';
import { currentUserAddressNameStringsState } from '@store/names';
import { Text } from './text';
import { useAtomValue } from 'jotai';
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

export const ProfileRow: React.FC<{
  children?: React.ReactNode;
  v1?: boolean;
  name: string;
}> = ({ v1 = false, name }) => {
  const nameString = usePunycode(name);
  const router = useRouter();
  const gradient = useGradient(name);
  const upgradePath = useAccountPath('/upgrade');

  const upgrade = useCallback(async () => {
    await router.push(upgradePath);
  }, [router, upgradePath]);

  const namePath = useAccountPath(`/names/[name]`, { name });

  const manage = useCallback(async () => {
    await router.push(namePath);
  }, [router, namePath]);
  const stxAddress = useAtomValue(stxAddressAtom);

  return (
    <SpaceBetween isInline alignItems={'center'} width="100%" height="136px" px="29px">
      <Stack alignItems={'center'} isInline>
        <StyledAvatar
          borderRadius="50%"
          aspectRatio="1"
          maxWidth="86px"
          maxHeight="86px"
          backgroundImage={gradient}
          onClick={async () => {
            if (v1) {
              await upgrade();
            } else {
              await manage();
            }
          }}
        />
        <Stack spacing="6px">
          <StyledName variant="Heading035" color={'$text'}>
            {nameString}
          </StyledName>
          <div className="flex flex-row gap-[27px] h-[27px] items-baseline">
            <LinkText
              href={`https://explorer.stacks.co/address/${stxAddress ?? ''}`}
              target="_blank"
              variant="Body02"
              color={'$onSurface-text-subdued'}
            >
              {truncateMiddle(stxAddress || '')}
            </LinkText>
            <Text variant="Body02" height="20px" color={'$onSurface-text-subdued'}>
              {v1 ? 'BNS Core' : 'BNSx'}
            </Text>
          </div>
        </Stack>
      </Stack>
      <StyledEditBox>
        <Stack isInline>
          <BoxLink href={namePath}>
            <Button variant="default">Edit</Button>
          </BoxLink>
          {v1 && <Button onClick={upgrade}>Upgrade</Button>}
        </Stack>
        {/* {v1 ? <Button onClick={upgrade}>Upgrade</Button> : <Button disabled>Edit</Button>} */}
      </StyledEditBox>
    </SpaceBetween>
  );
};

const Border: React.FC = () => {
  return (
    <Flex width="100%" px="29px" alignItems="center">
      <Box width="100%" height="1px" borderTop="1px solid $onSurface-border-subdued" />
    </Flex>
  );
};

export const Register: React.FC<{ children?: React.ReactNode }> = () => {
  const { switchAccounts } = useSwitchAccounts();
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [bnsName, setBnsName] = React.useState('');
  const network = useAtomValue(networkAtom);
  const clarigen = new ClarigenClient(network);
  const { openContractCall } = useOpenContractCall();
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const v1Name = allNames.coreName;

  const { bnsV1 } = contracts;
  const bnsContract = contractFactory(bnsV1, 'ST000000000000000000002AMW42H.bns');

  const register = async () => {
    const { nameRegistrar } = contracts;
    const name = bnsName.split('.')[0] as string;
    const namespace = bnsName.split('.')[1] as string;
    const price = 2000000;
    const salt = '00';
    const hashedFqn = hashFqn(name, namespace, salt);

    const contract = contractFactory(
      nameRegistrar,
      `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registrar`
    );

    await openContractCall({
      ...contract.nameRegister({
        name: asciiToBytes(name),
        namespace: asciiToBytes(namespace),
        amount: price,
        hashedFqn: hashedFqn,
        salt: hexToBytes(salt),
      }),
      postConditionMode: PostConditionMode.Allow,
      async onFinish(data) {
        console.log('Broadcasted tx');
      },
    });
  };

  useEffect(() => {
    console.log('All names:', allNames);
  }, [allNames]);

  const rows = useMemo(() => {
    return (
      allNames?.bnsxNames.map((name, index) => {
        return (
          <Box key={`name-${name.id}`}>
            {index === 0 && <Border />}
            <ProfileRow name={name.name} />
            <Border />
          </Box>
        );
      }) ?? null
    );
  }, [allNames?.bnsxNames]);

  const noNames = useMemo(() => {
    return allNames.coreName === null && allNames.bnsxNames.length === 0;
  }, [allNames.coreName, allNames.bnsxNames.length]);

  const fetchBnsAddress = React.useCallback(async (e: any) => {
    const recipient = e.target.value;
    setBnsName(recipient);
    if (
      recipient.endsWith('.btc') ||
      recipient.endsWith('.stx') ||
      recipient.endsWith('.id') ||
      recipient.endsWith('.satoshi')
    ) {
      const canNameBeRegistered = bnsContract.canNameBeRegistered({
        namespace: asciiToBytes('satoshi'),
        name: asciiToBytes('sharko'),
      });
      const { value: isAvailable } = await clarigen.ro(canNameBeRegistered);
      console.log({ isAvailable });
      if (!isAvailable) {
        console.log('not available');
        return;
      }
      setIsAvailable(true);
    }
  }, []);

  return (
    <>
      <Box flexGrow={1} />
      <Stack width="100%" spacing="0px">
        {noNames ? (
          <div className="space-y-5 text-center">
            <div className="space-y-6">
              <h1 className="text-gray-200 text-7xl font-open-sauce-one font-medium tracking-normal leading-10">
                Claim your BNS
              </h1>
              <p className="text-gray-200 text-sm font-inter font-normal tracking-normal leading-6">
                Looks like this address doesn't own any BNS or BNSx names. Register a name below.
              </p>
            </div>
            <div className="flex w-full max-w-xl mx-auto items-center space-x-3">
              <div className="w-full relative">
                <Input
                  className="h-12 text-md"
                  type="text"
                  placeholder="BNS Name"
                  value={bnsName}
                  onChange={fetchBnsAddress}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  {bnsName.includes('.btc') ||
                  bnsName.includes('.stx') ||
                  bnsName.includes('.id') ||
                  bnsName.includes('.satoshi') ? (
                    isAvailable ? (
                      <div className="p-1 bg-green-500/10 dark:bg-green-500/10 rounded-2xl">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      </div>
                    ) : (
                      <div className="p-1 bg-red-500/10 dark:bg-red-500/10 rounded-2xl">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      </div>
                    )
                  ) : null}
                </div>
              </div>
              <Button className="w-50 text-md" size="lg" onClick={register}>
                Claim
              </Button>
            </div>
          </div>
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
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
