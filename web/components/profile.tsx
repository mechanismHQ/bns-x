import React, { useCallback, useMemo } from 'react';
import { Stack, Box, Flex, Grid, SpaceBetween, BoxProps } from '@nelson-ui/react';
import {
  currentUserNameIdsState,
  currentUserV1NameState,
  nameByIdState,
  userPrimaryNameState,
} from '@store/names';
import { Text } from './text';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { LoadableNameCard } from '@components/name-card';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { useGradient } from '@common/hooks/use-gradient';

export const ProfileRow: React.FC<{
  children?: React.ReactNode;
  v1?: boolean;
  name: string;
}> = ({ v1 = false, name }) => {
  const router = useRouter();
  const gradient = useGradient(name);
  const v1OuterProps: BoxProps = v1
    ? {
        backgroundColor: '$color-surface-error',
        border: '1px solid $border-error',
        borderRadius: '8px',
      }
    : {};

  const manage = useCallback(async () => {
    if (v1) {
      await router.push({
        pathname: '/upgrade',
      });
    } else {
      await router.push({
        pathname: '/names/[name]',
        query: { name },
      });
    }
  }, [router, v1, name]);

  return (
    <SpaceBetween
      isInline
      alignItems={'center'}
      width="100%"
      height="136px"
      px="27px"
      {...v1OuterProps}
    >
      <Stack alignItems={'center'} isInline>
        <Box borderRadius="50%" size="86px" backgroundImage={gradient} />
        <Stack spacing="6px">
          <Text variant="Heading035" color={v1 ? '$text-error' : '$text'}>
            {name}
          </Text>

          <Text
            variant="Body02"
            height="20px"
            color={v1 ? '$text-error-subdued' : '$onSurface-text-subdued'}
          >
            {v1 ? 'Legacy BNS: Upgrade to BNSx' : ''}
          </Text>
        </Stack>
      </Stack>
      <Box>
        <Button onClick={manage}>{v1 ? 'Upgrade' : 'Edit'}</Button>
        {/* {v1 ? <Button onClick={upgrade}>Upgrade</Button> : <Button disabled>Edit</Button>} */}
      </Box>
    </SpaceBetween>
  );
};

export const LoadableProfileRow: React.FC<{ children?: React.ReactNode; id: number }> = ({
  id,
}) => {
  const name = useAtomValue(nameByIdState(id));

  return <ProfileRow name={name.combined} />;
};

export const Profile: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const v1Name = useAtomValue(currentUserV1NameState);

  const holdings = useAtomValue(currentUserNameIdsState[0]);

  const rows = useMemo(() => {
    return holdings.map((id, index) => {
      return (
        <Box key={`name-${id}`}>
          {index === 0 && v1Name !== null ? null : (
            <Box width="100%" height="1px" borderTop="1px solid $onSurface-border-subdued" />
          )}
          <LoadableProfileRow id={id} />
          {/* {index !== holdings.length - 1 ? ( */}
          <Flex width="100%" px="29px" alignItems="center">
            <Box width="100%" height="1px" borderTop="1px solid $onSurface-border-subdued" />
          </Flex>
          {/* ) : null} */}
        </Box>
      );
    });
  }, [holdings, v1Name]);

  useEffect(() => {
    if (v1Name !== null && holdings.length === 0) {
      void router.push({ pathname: '/upgrade' });
    }
  }, [v1Name === null, holdings.length]);

  const mintName = useCallback(() => {
    window.open('https://btc.us', '_blank');
  }, []);

  return (
    <>
      <Box flexGrow={1} />
      <Stack width="100%" spacing="0px">
        {v1Name === null && holdings.length === 0 ? (
          <Stack spacing="0" alignContent="center" width="100%" textAlign="center">
            <Text width="100%" variant="Display02">
              No names here
            </Text>
            <Text width="100%" mt="15px" variant="Body02">
              Looks like this address doesn't own any BNS or BNSx names. Mint a name then come back.
            </Text>
            <Button type="big" onClick={mintName} mx="auto" mt="49px">
              Mint name
            </Button>
          </Stack>
        ) : (
          <>
            {v1Name !== null ? <ProfileRow v1 name={v1Name.combined} /> : null}
            {rows}
            <Flex py="25px" justifyContent="center">
              <Text variant="Caption01">You can send many BNSx names to this address</Text>
            </Flex>
          </>
        )}
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
