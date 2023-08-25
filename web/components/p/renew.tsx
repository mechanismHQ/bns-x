import React, { memo, useMemo } from 'react';
import { CenterBox } from '@components/layout';
import { Text } from '@components/text';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/router';
import { namespaceLifetimeState } from '@store/names';
import { Box, Flex, Stack } from '@nelson-ui/react';
import { loadable, waitForAll } from 'jotai/utils';
import { getNameParts } from '@bns-x/core';
import { nameExpirationBlocksRemainingState, renewalTxAtom, renewalTxidAtom } from '@store/profile';
import { useRenewName } from '@common/hooks/use-renew-name';
import { Button } from '@components/button';
import { Divider, DoneRow, PendingRow } from '@components/upgrade/rows';
import { useAccountPath } from '@common/hooks/use-account-path';
import { BoxLink } from '@components/link';

const RenewTx: React.FC = () => {
  const renewTxid = useAtomValue(renewalTxidAtom);
  const renewTx = useAtomValue(loadable(renewalTxAtom));
  const router = useRouter();
  const name = router.query.name as string;

  if (!renewTxid) return null;
  if (renewTx.state !== 'hasData') return null;

  return (
    <Stack spacing="0px" pt="0px">
      <Divider />
      {renewTx.data?.tx_status === 'success' ? (
        <DoneRow txidAtom={renewalTxidAtom}>{name} renewed</DoneRow>
      ) : (
        <PendingRow txidAtom={renewalTxidAtom}>Renewing {name}</PendingRow>
      )}
    </Stack>
  );
};

export const Renew: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const [_, namespace] = getNameParts(name);
  const [lifetime, expireBlocks] = useAtomValue(
    waitForAll([namespaceLifetimeState(namespace), nameExpirationBlocksRemainingState(name)])
  );
  const { renew, txid, isRequestPending } = useRenewName(name);
  const renewTx = useAtomValue(loadable(renewalTxAtom));
  const donePath = useAccountPath('/manage/[name]', { name });

  const duration = useMemo(() => {
    // const stxPrice = stxAmount.toFormat();
    const blocksPerYear = 144n * 365n;
    const years = lifetime / blocksPerYear;
    return years;
  }, [lifetime]);

  const expirationDate = useMemo(() => {
    if (expireBlocks === null) return null;
    const timeDiff = expireBlocks * 10 * 60 * 1000;
    const expireDate = new Date(new Date().getTime() + timeDiff);
    return expireDate.toLocaleDateString();
  }, [expireBlocks]);
  return (
    <>
      <Box flexGrow={1} />
      <Stack spacing="0" alignItems={'center'} width="100%" pb="50px" px="29px">
        <CenterBox mt="20px" mb="30px">
          <Stack spacing="0">
            <Stack p="30px">
              <Text variant="Heading035">Renew your name</Text>
              <Stack spacing="7px">
                <Text variant="Body01">{name}</Text>
                <Text variant="Caption01">
                  After renewing, your name&apos;s expiration will be set to {lifetime.toString()}{' '}
                  blocks (about {duration.toString()} years) from now.
                </Text>
                <Text variant="Caption01">There is no cost to renew your name.</Text>
                <Text variant="Caption01">
                  Your name is currently set to expire on roughly {expirationDate} ({expireBlocks}{' '}
                  blocks).
                </Text>
                <Text variant="Caption01" color="$text-dim"></Text>
              </Stack>
            </Stack>
            <RenewTx />
          </Stack>
        </CenterBox>
        <Flex width="100%" justifyContent="center">
          {!txid && (
            <Button type="big" disabled={isRequestPending} onClick={renew}>
              {isRequestPending ? 'Confirming...' : 'Renew'}
            </Button>
          )}
          {renewTx.state === 'hasData' && renewTx.data?.tx_status === 'success' && (
            <BoxLink href={donePath}>
              <Button type="big" disabled={isRequestPending}>
                Done
              </Button>
            </BoxLink>
          )}
        </Flex>
      </Stack>
      <Box flexGrow={1} />
    </>
  );
};
