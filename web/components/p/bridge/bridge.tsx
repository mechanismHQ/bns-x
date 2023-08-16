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
