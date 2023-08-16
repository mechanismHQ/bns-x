import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@components/text';
import { inscriptionContentForName } from '@bns-x/core';
import {
  bridgeBurnScriptState,
  bridgeInscriptionIdAtom,
  bridgeWrapTxidAtom,
  fetchSignatureForInscriptionId,
  inscribedNamesAtom,
  inscriptionIdForNameAtom,
  verifiedBurnAddressState,
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
import { DuplicateIcon } from '@components/icons/duplicate';

export const BridgeUnwrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;

  const inscriptionId = useAtomValue(inscriptionIdForNameAtom(name));
  const burnAddress = useAtomValue(bridgeBurnScriptState);
  useAtomValue(loadable(verifiedBurnAddressState));

  const inscriptionUrl = useMemo(() => {
    return getInscriptionUrl(inscriptionId || '');
  }, [inscriptionId]);

  if (inscriptionId === null) return null;
  if (burnAddress === null) return null; // logged out

  return (
    <div className="flex gap-5 flex-col px-[29px]">
      <Text variant="Heading035">Bridge {name} to L2</Text>
      <Text variant="Body01">
        <Link href={inscriptionUrl} target="_blank">
          View inscription
        </Link>
      </Text>
      <Text variant="Heading04">Step 1: transfer the inscription</Text>
      <Text variant="Body01">
        In order to bridge {name} to the Stacks chain, you first need to transfer the inscription to
        a burn address. This burn address is uniquely tied to your Stacks address.
      </Text>
      <Text variant="Body01">Your burn address is:</Text>
      <CodeBlock py="12px">
        <div className="flex justify-between w-full items-center">
          <span>{burnAddress}</span>
          <DuplicateIcon clipboardText={burnAddress} />
        </div>
      </CodeBlock>
    </div>
  );
};
