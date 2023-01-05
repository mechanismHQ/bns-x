import React, { useCallback, useEffect } from 'react';
import { Box, Stack, Text } from '@nelson-ui/react';
import { useQueryAtom } from 'jotai-query-toolkit';
import { useTypedTxReceipt } from '../common/store';
import { contracts } from '../common/clarigen';
import { useAtomValue } from 'jotai/utils';
import { useRouter } from 'next/router';
import { SafeSuspense } from './safe-suspense';
import { Link, LinkButton } from './link';

type MigrateFn = typeof contracts['wrapperMigrator']['functions']['migrate'];

export const Loader = () => {
  return (
    <Box textAlign="center">
      <Text variant="Heading03">Waiting for transaction...</Text>
    </Box>
  );
};

export const PendingStream = () => {
  return (
    <SafeSuspense fallback={<Loader />}>
      <Pending />
    </SafeSuspense>
  );
};

export const Pending: React.FC = () => {
  const router = useRouter();
  const txid = router.query.txid as string;
  const [tx] = useTypedTxReceipt<MigrateFn>(txid);

  useEffect(() => {
    if (tx?.finished && tx.success && tx.result.isOk) {
      const swapId = tx.result.value;
      // void route(swapId);
      void router.push({
        pathname: '/streams/[id]',
        query: { id: swapId.toString() },
      });
    }
  }, [tx?.finished, tx?.result, router, tx?.success]);

  if (tx?.success === false) {
    return (
      <Stack>
        <Text variant="Body01" color="$action-critical">
          Your transaction failed:
        </Text>
        <Text variant="Body01" fontFamily="Courier New">
          {tx.transaction.tx_status}
        </Text>
        <LinkButton href="/create-stream">Create a new stream</LinkButton>
      </Stack>
    );
  }

  return (
    <Stack>
      <Text variant="Heading03">Waiting for transaction...</Text>
    </Stack>
  );
};
