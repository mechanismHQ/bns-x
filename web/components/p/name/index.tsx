import React, { useCallback, useMemo } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../../text';
import { useRouter } from 'next/router';
import { Button } from '@components/button';
import { useAtom, useAtomValue } from 'jotai';
import { nameDetailsAtom, nameExpirationBlockState } from '@store/names';
import { getTxUrl } from '@common/utils';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { loadable, useAtomCallback } from 'jotai/utils';
import {
  unwrapTxidAtom,
  zonefileBtcAtom,
  zonefileNostrAtom,
  zonefileRedirectAtom,
  isEditingProfileAtom,
  profileFormValidAtom,
  nameExpirationBlocksRemainingState,
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
import { useAccountPath } from '@common/hooks/use-account-path';
import { useAccount } from '@micro-stacks/react';
import { RenewButton } from '@components/p/name/renew-button';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import format from 'date-fns/format';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@components/ui/tooltip';

export const Name: React.FC<{ children?: React.ReactNode }> = () => {
  useWatchPendingZonefile();
  const router = useRouter();
  const name = router.query.name as string;
  const nameDetails = useAtomValue(nameDetailsAtom(name));
  const gradient = useGradient(name);
  const expBlock = useAtomValue(loadable(nameExpirationBlockState(name)));
  const expBlocks = useAtomValue(loadable(nameExpirationBlocksRemainingState(name)));
  const stxAddress = useAtomValue(stxAddressAtom);
  const setEditing = useSetEditing();
  const isEditing = useAtomValue(isEditingProfileAtom);

  const upgradePath = useAccountPath('/upgrade');
  const unwrapPath = useAccountPath('/unwrap/[name]', { name });
  const accountPath = useAccountPath('');

  const expirationDate = useDeepMemo(() => {
    if (expBlocks.state !== 'hasData') return null;
    if (expBlocks.data === null) {
      return 'No expiration';
    }
    const timeDiff = expBlocks.data * 10 * 60 * 1000;
    const expireDate = new Date(new Date().getTime() + timeDiff);
    const dateString = format(expireDate, 'yyyy-MM-dd');
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            Expires <span style={{ color: 'var(--colors-text)' }}>{dateString}</span>
          </TooltipTrigger>
          <TooltipContent hidden={expBlock.state !== 'hasData'}>
            {expBlock.state === 'hasData' && expBlock.data !== null && (
              <p>Expires at Stacks block {expBlock.data}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [expBlocks]);

  const upgrade = useCallback(async () => {
    await router.push(upgradePath);
  }, [router, upgradePath]);

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
              {expirationDate !== null && (
                <Text variant="Label02" color="$text-subdued">
                  {expirationDate}
                </Text>
              )}
              <DuplicateIcon clipboardText={name} copyLabel="Copy Name" />
            </Stack>
          </SpaceBetween>
          <Stack pt="20px" spacing="14px" width="280px">
            {isBnsx ? (
              <>
                <Button
                  width="100%"
                  onClick={async () => {
                    await router.push(unwrapPath);
                  }}
                >
                  Unwrap
                </Button>
              </>
            ) : (
              <>
                <Button width="100%" onClick={upgrade}>
                  Upgrade to BNSx
                </Button>
                {!isEditing && (
                  <Button tertiary width="100%" onClick={() => setEditing()}>
                    Edit
                  </Button>
                )}
              </>
            )}
            <RenewButton name={name} />
          </Stack>
        </LeftBar>
        <ElementGap />
        <RightBar spacing="0px">
          {isBnsx ? (
            <Stack spacing="10px">
              <Box>
                <Text variant="Heading035" position="relative" top="-10px">
                  Customize your name
                </Text>
              </Box>
              <Text variant="Body01">
                Customizing your name is not yet available for BNSx names. Check back soon!
              </Text>
              <Box mt="20px">
                <Button
                  type="big"
                  onClick={async () => {
                    await router.push(accountPath);
                  }}
                >
                  Go back
                </Button>
              </Box>
            </Stack>
          ) : (
            <>
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
                    Wallet currently holding this name on the Stacks chain.
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
                  <RowDescription>
                    Apps can use this to redirect users to your website
                  </RowDescription>
                </TitleBox>
                <EditableAddressGroup atom={zonefileRedirectAtom} />
              </Row>
              <Divider />
              <ProfileActions />
            </>
          )}
        </RightBar>
      </PageContainer>
    </>
  );
};
