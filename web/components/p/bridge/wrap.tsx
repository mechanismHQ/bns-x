import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@components/text';
import { inscriptionContentForName } from '@bns-x/bridge';
import { bridgeInscriptionIdAtom, bridgeWrapTxidAtom, inscribedNamesAtom } from '@store/bridge';
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

export const BridgeWrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const inscriptionId = useInput(useAtom(bridgeInscriptionIdAtom));
  const inscribedNames = useAtomValue(inscribedNamesAtom);
  const wrapTxid = useAtomValue(bridgeWrapTxidAtom);

  useDeepCompareEffect(() => {
    console.log(inscribedNames);
  }, [inscribedNames]);

  const inscriptionContent = useMemo(() => {
    return inscriptionContentForName(name);
  }, [name]);

  const [_, copyInscription] = useCopyToClipboard();
  // prefetch:
  useAtomValue(loadable(nameDetailsAtom(name)));

  const copyToClipboard = useCallback(async () => {
    await copyInscription(inscriptionContent);
  }, [inscriptionContent, copyInscription]);

  const { fetchSignature } = useBridgeWrap();
  return (
    <div className="flex gap-5 flex-col px-[29px]">
      {wrapTxid ? (
        <WrapTx />
      ) : (
        <>
          <Text variant="Heading02">
            Bridge <span className="font-mono">{name}</span> to L1
          </Text>
          <Text variant="Heading035">Step 1: Inscribe your name</Text>
          <Text variant="Body01">Create a new inscription with the following content:</Text>
          <CodeBlock>{inscriptionContent}</CodeBlock>
          <div className="flex gap-5">
            <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
            <Button>Download file</Button>
          </div>
          <Text variant="Heading035">Step 2: Submit your inscription</Text>
          <Text variant="Body01">
            Once your inscription is created, submit it to the bridge by entering the inscription
            ID:
          </Text>
          <Input placeholder="Enter your inscription ID" {...inscriptionId.props}></Input>
          <div className="flex">
            <Button onClick={fetchSignature}>Submit</Button>
          </div>
        </>
      )}
    </div>
  );
};
