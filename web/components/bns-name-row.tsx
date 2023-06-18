import React from 'react';
import { Stack, Box } from '@nelson-ui/react';
import { ClarigenClient, contractFactory } from '@clarigen/core';
import { asciiToBytes, hexToBytes, bytesToHex } from 'micro-stacks/common';
import { networkAtom } from '@store/micro-stacks';
import { Check, AlertCircle } from 'lucide-react';
import { isMainnetState } from '@store/index';
import { namePriceState } from '@store/names';
import { Spinner } from '@components/spinner';
import { useDebounce } from 'usehooks-ts';
import { Text } from './text';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { Button } from '@components/ui/button';
import { useGradient } from '@common/hooks/use-gradient';
import { stxAddressAtom } from '@store/micro-stacks';
import { ustxToStx } from '@common/utils';
import { styled } from '@common/theme';
import { useOpenContractCall } from '@micro-stacks/react';
import { hashFqn, contracts } from '@bns-x/core';
import { PostConditionMode } from 'micro-stacks/transactions';

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

export const BnsNameRow: React.FC<{
  name: string;
  namespace: string;
}> = ({ name, namespace }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [price, setPrice] = React.useState(0n);
  const debouncedValue = useDebounce<string>(name, 1000);
  const gradient = useGradient(name);
  const { openContractCall } = useOpenContractCall();
  const { bnsV1 } = contracts;
  const bnsContract = contractFactory(bnsV1, 'ST000000000000000000002AMW42H.bns');
  const stxAddress = useAtomValue(stxAddressAtom);
  const network = useAtomValue(networkAtom);
  const clarigen = new ClarigenClient(network);
  const isMainnet = useAtomValue(isMainnetState);

  const memoizedNamePriceState = React.useMemo(
    () => namePriceState(`${debouncedValue || 'default'}.${isMainnet ? namespace : 'satoshi'}`),
    [debouncedValue, namespace]
  );
  const namePrice = useAtomValue(memoizedNamePriceState);

  useEffect(() => {
    async function checkAvailability() {
      if (debouncedValue.length >= 2) {
        setIsLoading(true);
        const canNameBeRegistered = bnsContract.canNameBeRegistered({
          namespace: asciiToBytes(namespace),
          name: asciiToBytes(name),
        });

        const { value: isAvailable } = await clarigen.ro(canNameBeRegistered);
        setTimeout(() => {
          setIsAvailable(isAvailable as boolean);
          setPrice(namePrice);
          setIsLoading(false);
        }, 500);
      } else {
        setIsAvailable(false);
      }
      if (debouncedValue.length === 0) {
        setPrice(0n);
      }
      setIsLoading(false);
    }

    checkAvailability();
  }, [debouncedValue]);

  const register = async () => {
    const { nameRegistrar } = contracts;
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
        amount: Number(price),
        hashedFqn: hashedFqn,
        salt: hexToBytes(salt),
      }),
      postConditionMode: PostConditionMode.Allow,
      async onFinish(data) {
        console.log('Broadcasted tx');
      },
    });
  };
  return (
    <div className="flex items-center justify-between w-full h-24 px-8">
      <div className="flex items-center flex-row gap-4 min-w-0">
        <StyledAvatar
          borderRadius="50%"
          aspectRatio="1"
          maxWidth="43px"
          maxHeight="43px"
          backgroundImage={gradient}
        />
        <div className="flex flex-col gap-1 min-w-0">
          <StyledName variant="Heading035" color={'$text'}>
            {name}.{namespace}
          </StyledName>
          <div className="flex flex-row gap-[27px] h-[27px] items-baseline">
            <Text variant="Body02" height="20px" color={'$onSurface-text-subdued'}>
              {Number(ustxToStx(price))} STX
            </Text>
          </div>
        </div>
      </div>
      <StyledEditBox>
        {isLoading ? (
          <Spinner size={16} color="currentColor" />
        ) : (
          <Stack isInline>
            {isAvailable ? (
              <Button variant="default" onClick={register}>
                Claim
              </Button>
            ) : (
              <Box display="flex" alignItems="center" opacity={0.5}>
                <AlertCircle size={16} />
                <Text variant="Body02" marginLeft="8px">
                  Not Available
                </Text>
              </Box>
            )}
          </Stack>
        )}
      </StyledEditBox>
    </div>
  );
};
