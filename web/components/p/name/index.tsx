import React, { useCallback, useMemo } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../../text';
import { useRouter } from 'next/router';
import { Button } from '@components/button';
import { useAtomValue } from 'jotai';
import { nameDetailsAtom } from '@store/names';
import { useUnwrap } from '@common/hooks/use-unwrap';
import { getTxUrl } from '@common/utils';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { loadable, useAtomCallback } from 'jotai/utils';
import { nameExpirationAtom, unwrapTxidAtom } from '@store/profile';
import { useGradient } from '@common/hooks/use-gradient';
import { DuplicateIcon } from '@components/icons/duplicate';
import {
  AddMeHeader,
  AddressGroup,
  AddressHeader,
  Divider,
  ElementGap,
  InputGroup,
  LeftBar,
  PageContainer,
  RightBar,
  Row,
  RowDescription,
  TitleBox,
} from '@components/p/name/row';

function useOpenUnwrap() {
  const openUnwrap = useAtomCallback(
    useCallback(get => {
      const txid = get(unwrapTxidAtom);
      const network = get(networkAtom);
      if (!txid) return;
      const txUrl = getTxUrl(txid, network);
      window.open(txUrl, '_blank');
    }, [])
  );
  return {
    openUnwrap,
  };
}

export const Name: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const nameDetails = useAtomValue(nameDetailsAtom(name));
  const gradient = useGradient(name);
  const expiration = useAtomValue(loadable(nameExpirationAtom(name)));
  const stxAddress = useAtomValue(stxAddressAtom);

  if (nameDetails === null) {
    return (
      <>
        <Box flexGrow={1} />
        <Box>
          <Text variant="Display02">Name not found</Text>
        </Box>
        <Box flexGrow={1} />
      </>
    );
  }

  const { isBnsx } = nameDetails;

  return (
    <>
      {/* <Box flexGrow={1} /> */}
      <PageContainer
        width="100%"
        spacing="0"
        isInline
        // mt="34px"
        px="29px"
        alignContent="center"
      >
        <LeftBar spacing="32px">
          <Box size="120px" borderRadius="50%" backgroundImage={gradient} />
          <SpaceBetween height="73px" alignItems={'baseline'} flexDirection="column">
            <Text variant="Heading035">{nameDetails.decoded}</Text>
            <Stack spacing="25px" isInline alignItems={'center'}>
              <Text variant="Label02" color="$text-subdued">
                {isBnsx ? 'BNSx' : 'BNS Core'}
              </Text>
              {expiration.state === 'hasData' && (
                <Text variant="Label02" color="$text-subdued">
                  {expiration.data === null ? (
                    'No expiration'
                  ) : (
                    <>
                      Expires <span style={{ color: 'var(--colors-text)' }}>{expiration.data}</span>
                    </>
                  )}
                </Text>
              )}
              <DuplicateIcon clipboardText={name} copyLabel="Copy Name" />
            </Stack>
          </SpaceBetween>
          <Stack pt="20px" spacing="14px" width="280px">
            <Button width="100%">Upgrade to BNSx</Button>
            <Button tertiary width="100%">
              Edit
            </Button>
          </Stack>
        </LeftBar>
        <ElementGap />
        <RightBar width="620px" flexGrow={1} alignItems="baseline" spacing="0px">
          <Box height="65px">
            <Text variant="Heading035" position="relative" top="-10px">
              Customize your name
            </Text>
          </Box>
          <Divider />
          <Row>
            <TitleBox>
              <AddressHeader>Stacks Address</AddressHeader>
              <RowDescription>
                Wallet currently holding this name on the Stacks Bitcoin layer.
              </RowDescription>
            </TitleBox>
            <AddressGroup>{stxAddress ?? ''}</AddressGroup>
          </Row>
          <Divider />
          <Row>
            <TitleBox>
              <AddMeHeader>Bitcoin Address</AddMeHeader>
              <RowDescription>
                Wallet currently holding this name on the Stacks Bitcoin layer.
              </RowDescription>
            </TitleBox>
            <AddressGroup>bc1qxy2kgdygjrsqtzq3p83kkfjhx0wlh</AddressGroup>
          </Row>
          <Divider />
          <Row>
            <TitleBox>
              <AddMeHeader>Nostr npub</AddMeHeader>
              <RowDescription>
                Wallet currently holding this name on the Stacks Bitcoin layer.
              </RowDescription>
            </TitleBox>
            <InputGroup />
            {/* <AddressGroup>{stxAddress ?? ''}</AddressGroup> */}
          </Row>
        </RightBar>
      </PageContainer>
      {/* <Box flexGrow={1} /> */}
    </>
  );
};
