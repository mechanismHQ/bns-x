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
import type { ContractCallTyped, TypedAbiArg } from '@clarigen/core';
import { contractFactory } from '@clarigen/core';
import {
  bridgeInscriptionIdAtom,
  bridgeWrapTxAtom,
  fetchSignatureForInscriptionId,
} from '@store/bridge';
import { useAtom, useAtomValue } from 'jotai';
import { loadable, useAtomCallback } from 'jotai/utils';
import { useInput } from '@common/hooks/use-input';
import { CodeBlock } from '@components/code';
import { Beutton } from '@components/ui/beutton';
import { useCopyToClipboard } from 'usehooks-ts';
import { Input } from '@components/form';
import { bridgeContractState, clarigenAtom, contractsState } from '@store/index';
import { asciiToBytes, hexToBytes } from 'micro-stacks/common';
import {
  currentAccountAtom,
  networkAtom,
  stxAddressAtom,
  useCurrentAccountValue,
} from '@store/micro-stacks';
import { nameDetailsAtom } from '@store/names';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import { PostConditionMode } from 'micro-stacks/transactions';

export const BridgeWrap: React.FC<{ children?: React.ReactNode }> = () => {
  const router = useRouter();
  const name = router.query.name as string;
  const inscriptionId = useInput(useAtom(bridgeInscriptionIdAtom));
  const { openContractCall } = useAccountOpenContractCall();

  const inscriptionContent = useMemo(() => {
    return inscriptionContentForName(name);
  }, [name]);

  const [_, copyInscription] = useCopyToClipboard();
  // prefetch:
  useAtomValue(loadable(nameDetailsAtom(name)));

  // const account = useCurrentAccountValue();
  const account = useAtomValue(currentAccountAtom);

  if (typeof account === 'undefined') {
    throw new Error('Must be logged in');
  }
  const stxAddress = account.stxAddress;

  const copyToClipboard = useCallback(async () => {
    await copyInscription(inscriptionContent);
  }, [inscriptionContent, copyInscription]);

  const fetchSignature = useAtomCallback(
    useCallback(
      async (get, set) => {
        const inscriptionId = get(bridgeInscriptionIdAtom);
        const bridgeData = await fetchSignatureForInscriptionId({
          inscriptionId,
          fqn: name,
          recipient: stxAddress,
        });
        console.log('signature', bridgeData);
        const nameDetails = get(nameDetailsAtom(name))!;
        const clarigen = get(clarigenAtom);
        const fqnParts = parseFqn(name);
        const bridge = get(bridgeContractState);
        const nameBytes = asciiToBytes(fqnParts.name);
        const namespaceBytes = asciiToBytes(fqnParts.namespace);
        const baseParams = {
          name: nameBytes,
          namespace: namespaceBytes,
          inscriptionId: hexToBytes(inscriptionId),
        };
        let tx: ContractCallTyped<TypedAbiArg<any, string>[], any>;
        if (nameDetails.isBnsx) {
          tx = bridge.bridgeToL1({
            ...baseParams,
            signature: hexToBytes(bridgeData.signature),
          });
        } else {
          tx = bridge.migrateAndBridge({
            ...baseParams,
            bridgeSignature: hexToBytes(bridgeData.signature),
            migrateSignature: hexToBytes(bridgeData.migrateSignature),
            wrapper: bridgeData.wrapperId,
          });
        }
        const network = get(networkAtom);
        await openContractCall({
          ...tx,
          // todo: post conditions
          postConditionMode: PostConditionMode.Allow,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          network: {
            ...network,
            coreApiUrl: network.getCoreApiUrl(),
          },
          onFinish(payload) {
            console.log(payload);
            set(bridgeWrapTxAtom, payload.txId);
          },
        });
      },
      [name, stxAddress, openContractCall]
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
