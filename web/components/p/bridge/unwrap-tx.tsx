import React, { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { bridgeUnwrapTxState, bridgeUnwrapTxidAtom } from '@store/bridge';
import { loadable } from 'jotai/utils';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { CenterBox } from '@components/layout';
import { Divider, DoneRow, PendingRow } from '@components/upgrade/rows';
import { useRouter } from 'next/router';
import { Text } from '@components/text';
import { Button } from '@components/button';
import { useAccountPath } from '@common/hooks/use-account-path';

export const UnwrapTx: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const unwrapTx = useAtomValue(loadable(bridgeUnwrapTxState));

  const status = useDeepMemo(() => {
    if (unwrapTx.state !== 'hasData') return 'pending';
    if (unwrapTx.data === null) return 'pending';
    return unwrapTx.data.tx_status;
  }, [unwrapTx]);

  const namePath = useAccountPath(`/manage/[name]`, { name });

  const done = useCallback(async () => {
    await router.push(namePath);
  }, [router, namePath]);

  return (
    <div className="flex flex-col items-center w-full gap-5">
      <CenterBox mt="20px" mb="30px">
        <Text variant="Heading035" mx="30px" my="20px">
          Bridging {name} to L2
        </Text>
        <Divider />
        {status === 'pending' && (
          <PendingRow txidAtom={bridgeUnwrapTxidAtom}>Bridging {name} to Stacks</PendingRow>
        )}
        {status === 'success' && (
          <DoneRow txidAtom={bridgeUnwrapTxidAtom}>{name} bridged to Stacks</DoneRow>
        )}
      </CenterBox>
      {status === 'success' && (
        <Button type="big" onClick={done}>
          Done
        </Button>
      )}
    </div>
  );
};
