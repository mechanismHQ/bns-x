import React, { useEffect, useMemo } from 'react';
import { Box, Flex } from '@nelson-ui/react';
import { Text } from '../text';
import { useAtomValue } from 'jotai';
import { txReceiptState } from '@store/index';
import { wrapperDeployTxidAtom } from '@store/migration';
import { PendingRow } from '@components/upgrade/rows';
import { useFetchWrapperSig } from '@common/hooks/use-fetch-wrapper-sig';
import { CenterBox } from '@components/layout';

export const DeployPending: React.FC<{ children?: React.ReactNode }> = () => {
  const deployTxid = useAtomValue(wrapperDeployTxidAtom);
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
    <Box>
      <Text variant="Heading06">name.btc</Text>
      <CenterBox>
        <PendingRow txidAtom={wrapperDeployTxidAtom}>Waiting for your transaction</PendingRow>;
      </CenterBox>
    </Box>
  );
};
