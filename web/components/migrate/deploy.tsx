import React, { useMemo } from 'react';
import { Box, Text, Stack } from '@nelson-ui/react';
import { useDeployWrapper } from '@common/hooks/use-deploy-wrapper';
import { TransactionLink } from '@components/link';
import { Button } from '@components/button';
import { useAtom, useAtomValue } from 'jotai';
import { wrapperDeployTxidAtom } from '@common/store/migration';
import { useFetchWrapperSig } from '@common/hooks/use-fetch-wrapper-sig';
import { useEffect } from 'react';
import { useQueryAtom } from 'jotai-query-toolkit';
import { txReceiptState } from '@store/index';
import { PendingRow } from '@components/migrate/rows';

export const DeployStep: React.FC<{ children?: React.ReactNode }> = () => {
  const deployTxid = useAtomValue(wrapperDeployTxidAtom);
  const { deploy, isRequestPending: deployPending } = useDeployWrapper();
  const deployTx = useAtomValue(txReceiptState(deployTxid));
  const { fetchSig, signature } = useFetchWrapperSig();
  const txFinished = useMemo(() => {
    return deployTx?.tx_status === 'success';
  }, [deployTx?.tx_status]);

  useEffect(() => {
    if (deployTxid && txFinished) {
      fetchSig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployTxid, txFinished]);

  if (signature) return null;

  return (
    <Stack>
      {deployTxid ? (
        <PendingRow txidAtom={wrapperDeployTxidAtom}>Wrapper deploy pending</PendingRow>
      ) : (
        <Stack>
          <Text variant="Body02" maxWidth="400px">
            First up, let&apos;s deploy your name wrapper.
          </Text>
          <Box>
            <Button maxWidth="200px" onClick={deploy} disabled={deployPending}>
              {deployPending ? 'Waiting...' : 'Deploy'}
            </Button>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};
