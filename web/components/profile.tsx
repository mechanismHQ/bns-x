import React, { useCallback, useMemo } from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Stack, Box, Flex, SpaceBetween } from '@nelson-ui/react';
import {
  currentUserNameIdsState,
  currentUserV1NameState,
  userPrimaryNameState,
  currentUserNamesState,
} from '@store/names';
import type { ResponsiveVariant } from './text';
import { Text } from './text';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { Button } from '@components/button';
import { useRouter } from 'next/router';
import { useGradient } from '@common/hooks/use-gradient';
import { stxAddressAtom } from '@store/micro-stacks';
import { truncateMiddle } from '@common/utils';
import { Link, LinkText } from '@components/link';
import { styled } from '@common/theme';

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

// const StyledAvatar = styled(Box, {
//   '@bp1': {
//     width:
//   }
// })

export const ProfileRow: React.FC<{
  children?: React.ReactNode;
  v1?: boolean;
  name: string;
}> = ({ v1 = false, name }) => {
  const router = useRouter();
  const gradient = useGradient(name);

  const upgrade = useCallback(async () => {
    await router.push({
      pathname: '/upgrade',
    });
  }, [router]);

  const manage = useCallback(async () => {
    await router.push({
      pathname: '/names/[name]',
      query: { name },
    });
  }, [router, name]);
  const stxAddress = useAtomValue(stxAddressAtom);

  return (
    <SpaceBetween isInline alignItems={'center'} width="100%" height="136px" px="29px">
      <Stack alignItems={'center'} isInline>
        <Box
          borderRadius="50%"
          aspectRatio="1"
          maxWidth="86px"
          maxHeight="86px"
          size="86px"
          backgroundImage={gradient}
        />
        <Stack spacing="6px">
          <StyledName variant="Heading035" color={'$text'}>
            {name}
          </StyledName>

          <Stack isInline height="20px" spacing="27px">
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
          </Stack>
        </Stack>
      </Stack>
      <StyledEditBox>
        <Stack isInline>
          <Button onClick={manage} secondary={v1}>
            Edit
          </Button>
          {v1 && (
            <Button
              onClick={upgrade}
              // secondary
              // backgroundColor="$dark-primary-action-primary"
              // color="$text-onPrimary"
            >
              Upgrade
            </Button>
          )}
        </Stack>
        {/* {v1 ? <Button onClick={upgrade}>Upgrade</Button> : <Button disabled>Edit</Button>} */}
      </StyledEditBox>
    </SpaceBetween>
  );
};

const everRedirect = false; // dev: change to enable auto-redirect to 'upgrade'

export const Profile: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const v1Name = useAtomValue(currentUserV1NameState);
  const allNames = useAtomValue(currentUserNamesState);
  const hasV1 = v1Name !== null;
  const holdings = useAtomValue(currentUserNameIdsState);

  const shouldRedirect = useMemo(() => {
    const noBnsx = holdings.length === 0;
    const canRedirect = router.query.redirect !== 'false';
    return everRedirect && hasV1 && noBnsx && canRedirect;
    // return false;
  }, [hasV1, holdings.length, router.query.redirect]);

  useEffect(() => {
    console.log('All names:', allNames);
  }, [allNames]);

  const rows = useMemo(() => {
    return (
      allNames?.nameProperties.map((name, index) => {
        return (
          <Box key={`name-${name.id}`}>
            {index === 0 && v1Name !== null ? null : (
              <Box width="100%" px="29px">
                <Box height="1px" borderTop="1px solid $onSurface-border-subdued" width="100%" />
              </Box>
            )}
            <ProfileRow name={name.combined} />
            {/* <LoadableProfileRow id={name} /> */}
            {/* {index !== holdings.length - 1 ? ( */}
            <Flex width="100%" px="29px" alignItems="center">
              <Box width="100%" height="1px" borderTop="1px solid $onSurface-border-subdued" />
            </Flex>
            {/* ) : null} */}
          </Box>
        );
      }) ?? null
    );
  }, [allNames?.nameProperties, v1Name]);

  useEffect(() => {
    if (shouldRedirect) {
      void router.push({ pathname: '/upgrade' });
    }
  }, [shouldRedirect, router]);

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
              Looks like this address doesn&apos;t own any BNS or BNSx names. Mint a name then come
              back.
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
