import React, { memo, useCallback, useMemo } from 'react';
import { BridgeWrap } from './wrap';
import { useRouter } from 'next/router';
import {
  bridgeInscriptionIdAtom,
  bridgeUnwrapTxidAtom,
  bridgeWrapTxidAtom,
  fetchSignatureForInscriptionId,
  inscribedNamesAtom,
  inscriptionIdForNameAtom,
} from '@store/bridge';
import { useAtom, useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { useInput } from '@common/hooks/use-input';
import { CodeBlock } from '@components/code';
import { Button } from '@components/ui/button';
import { useCopyToClipboard } from 'usehooks-ts';
import { Input } from '@components/form';
import { nameDetailsAtom } from '@store/names';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { WrapTx } from '@components/p/bridge/wrap-tx';
import { useBridgeWrap } from '@common/hooks/use-bridge-wrap';
import { BridgeUnwrap } from '@components/p/bridge/unwrap';
import { L1_ENABLED } from '@common/constants';
import { Text } from '@components/ui/text';
import { FileWarning } from 'lucide-react';

export const BridgeName: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;

  const existingInscription = useAtomValue(inscriptionIdForNameAtom(name));
  const inscribedNames = useAtomValue(inscribedNamesAtom);
  const wrapTxid = useAtomValue(bridgeWrapTxidAtom);
  const unwrapTxid = useAtomValue(bridgeUnwrapTxidAtom);

  useDeepCompareEffect(() => {
    console.log(inscribedNames);
  }, [inscribedNames]);

  if (!L1_ENABLED) return <BridgeDisabled />;

  if (unwrapTxid) return <BridgeUnwrap />;

  if (existingInscription === null || wrapTxid) {
    return <BridgeWrap />;
  }

  return <BridgeUnwrap />;
  // return (
  //   <>
  //     <Text variant="Body01">{existingInscription}</Text>
  //   </>
  // );
};

export const BridgeDisabled: React.FC<{ children?: React.ReactNode }> = () => {
  return (
    <>
      <div className="flex-grow"></div>
      <div className="text-center max-w-xl mx-auto flex flex-col gap-8 items-center">
        <FileWarning className="w-[100px] h-[100px] text-dark-warning-icon-warning" />
        <Text variant="Heading03">BNS Inscriptions aren&apos;t live yet!</Text>
        <Text variant="Body01" className="text-text-subdued">
          Check back soon.
        </Text>
      </div>
      <div className="flex-grow"></div>
    </>
  );
};
