import React, { useCallback, useMemo } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../../text';
import { useRouter } from 'next/router';
import { Button } from '@components/button';
import { useAtom, useAtomValue } from 'jotai';
import { nameDetailsAtom } from '@store/names';
import { getTxUrl } from '@common/utils';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { loadable, useAtomCallback } from 'jotai/utils';
import {
  nameExpirationAtom,
  unwrapTxidAtom,
  zonefileBtcAtom,
  zonefileNostrAtom,
  zonefileRedirectAtom,
  isEditingProfileAtom,
  profileFormValidAtom,
} from '@store/profile';
import { useGradient } from '@common/hooks/use-gradient';
import { DuplicateIcon } from '@components/icons/duplicate';
import {
  AddMeHeader,
  AddressGroup,
  AddressHeader,
  Divider,
  EditableAddressGroup,
  ElementGap,
  InputGroup,
  LeftBar,
  PageContainer,
  RightBar,
  Row,
  RowDescription,
  TitleBox,
  useSetEditing,
} from '@components/p/name/row';
import { Link, LinkInner, LinkText } from '@components/link';
import { ProfileActions } from '@components/p/name/actions';
import { useWatchPendingZonefile } from '@common/hooks/use-watch-pending-zonefile';

export const Name: React.FC<{ children?: React.ReactNode }> = () => {
  useWatchPendingZonefile();
  const router = useRouter();
  const name = router.query.name as string;
  const nameDetails = useAtomValue(nameDetailsAtom(name));
  const gradient = useGradient(name);
  const expiration = useAtomValue(loadable(nameExpirationAtom(name)));
  const stxAddress = useAtomValue(stxAddressAtom);
  const setEditing = useSetEditing();
  const isEditing = useAtomValue(isEditingProfileAtom);

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
      <PageContainer width="100%" isInline px="29px">
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
            {!isEditing && (
              <Button tertiary width="100%" onClick={() => setEditing()}>
                Edit
              </Button>
            )}
          </Stack>
        </LeftBar>
        <ElementGap />
        <RightBar spacing="0px">
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
            <AddressGroup editable={false}>{stxAddress ?? ''}</AddressGroup>
          </Row>
          <Divider />
          <Row>
            <TitleBox>
              <AddMeHeader>Bitcoin Address</AddMeHeader>
              <RowDescription>Let others send Bitcoin to your BNS name</RowDescription>
            </TitleBox>
            <EditableAddressGroup atom={zonefileBtcAtom} />
          </Row>
          <Divider />
          <Row>
            <TitleBox>
              <AddMeHeader>Nostr npub</AddMeHeader>
              {/* <RowDescription></RowDescription> */}
            </TitleBox>
            <EditableAddressGroup atom={zonefileNostrAtom} />
          </Row>
          <Divider />
          <Row>
            <TitleBox>
              <AddMeHeader>Website redirect</AddMeHeader>
              <RowDescription>Apps can use this to redirect users to your website</RowDescription>
            </TitleBox>
            <EditableAddressGroup atom={zonefileRedirectAtom} />
          </Row>
          <Divider />
          <ProfileActions />
        </RightBar>
      </PageContainer>
    </>
  );
};
