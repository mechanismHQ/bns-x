import React, { useCallback, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import {
  bridgeWrapTxState,
  bridgeWrapTxidAtom,
  submittedBridgeInscriptionIdAtom,
} from '@store/bridge';
import { loadable } from 'jotai/utils';
import { useDeepMemo } from '@common/hooks/use-deep-memo';
import { CenterBox } from '@components/layout';
import { Divider, DoneRow, PendingRow } from '@components/upgrade/rows';
import { useRouter } from 'next/router';
import { Text } from '@components/text';
import { SpaceBetween, Stack } from '@nelson-ui/react';
import { ExternalTx } from '@components/icons/external-tx';
import { CheckIcon } from '@components/icons/check';
import { getInscriptionUrl } from '@common/utils';
import { ExternalLinkIcon } from '@components/icons/external-link';
import { Button } from '@components/button';

export const WrapTx: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const wrapTx = useAtomValue(loadable(bridgeWrapTxState));
  const inscriptionId = useAtomValue(submittedBridgeInscriptionIdAtom);

  const status = useDeepMemo(() => {
    if (wrapTx.state !== 'hasData') return 'pending';
    if (wrapTx.data === null) return 'pending';
    return wrapTx.data.tx_status;
  }, [wrapTx]);

  const inscriptionUrl = useMemo(() => {
    return getInscriptionUrl(inscriptionId || '');
  }, [inscriptionId]);

  const viewOnGamma = useCallback(() => {
    window.open(`https://gamma.io/inscription/${inscriptionId || ''}`, '_blank');
  }, [inscriptionId]);

  return (
    <div className="flex flex-col items-center w-full gap-5">
      <CenterBox mt="20px" mb="30px">
        <Text variant="Heading035" mx="30px" my="20px">
          Bridging {name}
        </Text>
        <Divider />
        <SpaceBetween isInline alignItems="center" p="30px">
          <Stack isInline spacing="$3" alignItems="center">
            <CheckIcon />
            <Text variant="Label01" color="$onSurface-text">
              Inscription confirmed
            </Text>
          </Stack>
          <ExternalLinkIcon href={inscriptionUrl} />
        </SpaceBetween>
        <Divider />
        {status === 'pending' && (
          <PendingRow txidAtom={bridgeWrapTxidAtom}>Bridging {name} to Bitcoin L1</PendingRow>
        )}
        {status === 'success' && (
          <DoneRow txidAtom={bridgeWrapTxidAtom}>{name} bridged to Bitcoin L1</DoneRow>
        )}
      </CenterBox>
      {status === 'success' && (
        <Button type="big" onClick={viewOnGamma}>
          View on Gamma
        </Button>
      )}
    </div>
  );
};
