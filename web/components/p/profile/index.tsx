import React, { memo, useCallback, useMemo } from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Stack, Box, Flex, SpaceBetween } from '@nelson-ui/react';
import { currentUserV1NameState, currentUserAddressNameStringsState } from '@store/names';
import { Text } from '../../text';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { Button } from '@components/button';
import { BoxLink } from '@components/link';
import { useAccountPath } from '@common/hooks/use-account-path';
import { ProfileRow } from './profile-row';

const Border: React.FC = () => {
  return (
    <Flex width="100%" px="29px" alignItems="center">
      <Box width="100%" height="1px" borderTop="1px solid $onSurface-border-subdued" />
    </Flex>
  );
};

export const Profile: React.FC<{ children?: React.ReactNode }> = () => {
  const allNames = useAtomValue(currentUserAddressNameStringsState);
  const v1Name = allNames.coreName;

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

  const registerPath = useAccountPath('/register');

  const noNames = useMemo(() => {
    return allNames.coreName === null && allNames.bnsxNames.length === 0;
  }, [allNames.coreName, allNames.bnsxNames.length]);

  return (
    <>
      <Box flexGrow={1} />
      <Stack width="100%" spacing="0px">
        {noNames ? (
          <Stack spacing="0" alignContent="center" width="100%" textAlign="center">
            <Text width="100%" variant="Display02">
              No names here
            </Text>
            <Text width="100%" mt="15px" variant="Body02">
              Looks like this address doesn&apos;t own any BNS or BNSx names. Mint a name then come
              back.
            </Text>
            <BoxLink href={registerPath}>
              <Button type="big" mx="auto" mt="49px">
                Register a name
              </Button>
            </BoxLink>
          </Stack>
        ) : (
          <>
            {v1Name !== null ? (
              <>
                <Border />
                <ProfileRow v1 name={v1Name} />
                {rows?.length === 0 && <Border />}
              </>
            ) : null}
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
