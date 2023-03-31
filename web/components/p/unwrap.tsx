import React from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { CenterBox } from '@components/layout';
import { Text } from '@components/text';
import { useAtomValue, atom } from 'jotai';
import { useRouter } from 'next/router';
import { Button } from '@components/button';
import { Checkbox } from '@components/checkbox';
import { BnsRecipientField } from '@components/bns-recipient-field';
import { useUnwrap } from '@common/hooks/use-unwrap';
import { unwrapTxAtom, unwrapTxidAtom, unwrapRecipientState } from '@store/profile';
import { Divider, DoneRow, PendingRow } from '@components/upgrade/rows';
import { loadable } from 'jotai/utils';
import { stxAddressAtom } from '@store/micro-stacks';
import { ErrorIcon } from '@components/icons/error';

export const TransferredRow = () => {
  const recipient = useAtomValue(unwrapRecipientState.validRecipientState);
  const stxAddress = useAtomValue(stxAddressAtom);

  if (recipient === null || recipient === stxAddress) return null;

  return (
    <>
      <Divider />
      <DoneRow>BNS name transferred</DoneRow>
    </>
  );
};

export const UnwrapTx = () => {
  const unwrapTxid = useAtomValue(unwrapTxidAtom);
  const unwrapTx = useAtomValue(unwrapTxAtom);
  const router = useRouter();
  const name = router.query.name as string;

  if (typeof unwrapTxid === 'undefined') return null;

  return (
    <Stack spacing="0" pt="10px">
      {unwrapTx?.tx_status === 'success' ? (
        <>
          <Divider />
          <DoneRow txidAtom={unwrapTxidAtom}>{name} unwrapped</DoneRow>
          <TransferredRow />
        </>
      ) : (
        <>
          <Divider />
          <PendingRow txidAtom={unwrapTxidAtom}>Waiting for confirmations</PendingRow>
        </>
      )}
    </Stack>
  );
};

export const Unwrap = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const doSendElsewhere = useAtomValue(unwrapRecipientState.sendElsewhereAtom);
  const { canUnwrap, unwrap, isRequestPending, unwrapTxid, recipientHasBns } = useUnwrap(name);
  const unwrapTx = useAtomValue(loadable(unwrapTxAtom));

  return (
    <>
      <Box flexGrow={1} />
      <Stack spacing="0" alignItems={'center'} width="100%" pb="50px" px="29px">
        <CenterBox mt="20px" mb="30px">
          <Stack spacing="0">
            <Stack p="30px" pb="0px">
              <Text variant="Heading035">Unwrap</Text>
              <Stack spacing="7px">
                <Text variant="Body01">{name}</Text>
                <Text variant="Caption01">
                  Unwrapping will convert your BNSx name back to BNS. Your BNSx name will be burnt
                  in the process of unwrapping your name.
                </Text>
                <Text variant="Caption01" color="$text-dim"></Text>
              </Stack>
            </Stack>
            <UnwrapTx />
            {typeof unwrapTxid === 'undefined' && (
              <Stack spacing="13px" p="30px" pt="20px">
                <Stack isInline spacing="$3" alignItems="center">
                  <Checkbox atom={unwrapRecipientState.sendElsewhereAtom} />
                  <Text variant="Label01" color="$onSurface-text">
                    Send to different address
                    <span style={{ color: 'var(--colors-onSurface-text-subdued)' }}>
                      {' '}
                      (optional)
                    </span>
                  </Text>
                </Stack>
                {doSendElsewhere && <BnsRecipientField recipientState={unwrapRecipientState} />}
                {recipientHasBns.state === 'hasData' && recipientHasBns.data && (
                  <Stack isInline spacing="$3" alignItems="center">
                    <ErrorIcon />
                    <Text variant="Label02" color="$text-error">
                      {doSendElsewhere ? 'Recipient already has' : 'You already have'} a BNS name
                    </Text>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        </CenterBox>
        <Flex width="100%" justifyContent="center">
          {typeof unwrapTxid === 'undefined' && (
            <Button
              type="big"
              disabled={!canUnwrap}
              onClick={async () => {
                if (canUnwrap) await unwrap();
              }}
            >
              {isRequestPending ? 'Waiting' : 'Unwrap'}
            </Button>
          )}
          {unwrapTx.state === 'hasData' && unwrapTx.data?.tx_status === 'success' && (
            <Button
              type="big"
              onClick={async () => {
                await router.push('/');
              }}
            >
              Done
            </Button>
          )}
        </Flex>
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
