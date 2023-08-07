import React, { memo, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Text } from '@components/text';
import {
  inscriptionContentForName,
  inscriptionContentType,
  contracts,
  deployments,
  parseFqn,
} from '@bns-x/core';
import { contractFactory } from '@clarigen/core';
import { bridgeInscriptionIdAtom, fetchSignatureForInscriptionId } from '@store/bridge';
import { useAtom, useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useInput } from '@common/hooks/use-input';
import { CodeBlock } from '@components/code';
import { Beutton } from '@components/ui/beutton';
import { useCopyToClipboard } from 'usehooks-ts';
import { Input } from '@components/form';
import { clarigenAtom, contractsState } from '@store/index';
import { asciiToBytes, hexToBytes } from 'micro-stacks/common';

export const BridgeWrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const inscriptionId = useInput(useAtom(bridgeInscriptionIdAtom));

  const inscriptionContent = useMemo(() => {
    return inscriptionContentForName(name);
  }, [name]);

  const [_, copyInscription] = useCopyToClipboard();

  const copyToClipboard = useCallback(async () => {
    await copyInscription(inscriptionContent);
  }, [inscriptionContent, copyInscription]);

  const fetchSignature = useAtomCallback(
    useCallback(
      async (get, set) => {
        const inscriptionId = get(bridgeInscriptionIdAtom);
        const signature = await fetchSignatureForInscriptionId(inscriptionId, name);
        console.log('signature', signature);
        const clarigen = get(clarigenAtom);
        const fqnParts = parseFqn(name);
        const bridge = contractFactory(contracts.l1BridgeV1, deployments.l1BridgeV1.devnet);
        const isValid = await clarigen.ro(
          bridge.validateWrapSignature({
            signature: hexToBytes(signature),
            name: asciiToBytes(fqnParts.name),
            namespace: asciiToBytes(fqnParts.namespace),
            inscriptionId: hexToBytes(inscriptionId),
          })
        );
        console.log('isValid', isValid);
      },
      [name]
    )
  );

  return (
    <div className="flex gap-5 flex-col px-[29px]">
      <Text variant="Heading02">
        Bridge <span className="font-mono">{name}</span> to L1
      </Text>
      <Text variant="Heading035">Step 1: Inscribe your name</Text>
      <Text variant="Body01">Create a new inscription with the following content:</Text>
      <CodeBlock>{inscriptionContent}</CodeBlock>
      <div className="flex gap-5">
        <Beutton onClick={copyToClipboard}>Copy to Clipboard</Beutton>
        <Beutton>Download file</Beutton>
      </div>
      <Text variant="Heading035">Step 2: Submit your inscription</Text>
      <Text variant="Body01">
        Once your inscription is created, submit it to the bridge by entering the inscription ID:
      </Text>
      <Input placeholder="Enter your inscription ID" {...inscriptionId.props}></Input>
      <div className="flex">
        <Beutton onClick={fetchSignature}>Submit</Beutton>
      </div>
    </div>
  );
};
