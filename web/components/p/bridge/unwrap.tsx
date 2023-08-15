import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@components/text';
import { inscriptionContentForName } from '@bns-x/core';
import {
  bridgeInscriptionIdAtom,
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
import { Link } from '@components/link';
import { getInscriptionUrl } from '@common/utils';

export const BridgeUnwrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;

  const inscriptionId = useAtomValue(inscriptionIdForNameAtom(name));

  const inscriptionUrl = useMemo(() => {
    return getInscriptionUrl(inscriptionId || '');
  }, [inscriptionId]);

  if (inscriptionId === null) return null;
  return (
    <div className="flex gap-5 flex-col px-[29px]">
      <Text variant="Heading035">Bridge {name} to L2</Text>
      <Text variant="Body01">
        <Link href={inscriptionUrl} target="_blank">
          View inscription
        </Link>
      </Text>
    </div>
  );
};
