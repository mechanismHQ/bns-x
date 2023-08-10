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
import { contractFactory, makeNonFungiblePostCondition } from '@clarigen/core';
import {
  bridgeInscriptionIdAtom,
  bridgeWrapTxAtom,
  fetchSignatureForInscriptionId,
} from '@store/bridge';
import { useAtom, useAtomValue } from 'jotai';
import { loadable, useAtomCallback } from 'jotai/utils';
import { useInput } from '@common/hooks/use-input';
import { CodeBlock } from '@components/code';
import { Button } from '@components/ui/button';
import { useCopyToClipboard } from 'usehooks-ts';
import { Input } from '@components/form';
import {
  bnsContractState,
  bridgeContractState,
  clarigenAtom,
  contractsState,
  nameRegistryState,
} from '@store/index';
import { asciiToBytes, hexToBytes } from 'micro-stacks/common';
import {
  currentAccountAtom,
  networkAtom,
  stxAddressAtom,
  useCurrentAccountValue,
} from '@store/micro-stacks';
import { nameDetailsAtom } from '@store/names';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import type { PostCondition } from 'micro-stacks/transactions';
import { NonFungibleConditionCode, PostConditionMode } from 'micro-stacks/transactions';
import { nameToTupleBytes } from '@common/utils';

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
          sender: stxAddress,
        });
        console.log('signature', bridgeData);
        const nameDetails = get(nameDetailsAtom(name))!;
        const fqnParts = parseFqn(name);
        const bridge = get(bridgeContractState);
        const nameBytes = asciiToBytes(fqnParts.name);
        const namespaceBytes = asciiToBytes(fqnParts.namespace);
        const bnsx = get(nameRegistryState);
        const baseParams = {
          name: nameBytes,
          namespace: namespaceBytes,
          inscriptionId: hexToBytes(inscriptionId),
        };
        let tx: ContractCallTyped<TypedAbiArg<any, string>[], any>;
        const postConditions: PostCondition[] = [];
        if (nameDetails.isBnsx) {
          const bnsxPostCondition = makeNonFungiblePostCondition(
            bnsx,
            stxAddress,
            NonFungibleConditionCode.DoesNotOwn,
            BigInt(nameDetails.id)
          );
          postConditions.push(bnsxPostCondition);
          tx = bridge.bridgeToL1({
            ...baseParams,
            signature: hexToBytes(bridgeData.signature),
          });
        } else {
          const bns = get(bnsContractState);
          const nameTupleId = nameToTupleBytes(name);
          // moves bns to wrapper
          const bnsPostCondition = makeNonFungiblePostCondition(
            bns,
            stxAddress,
            NonFungibleConditionCode.DoesNotOwn,
            nameTupleId
          );
          postConditions.push(bnsPostCondition);
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
          postConditionMode: PostConditionMode.Deny,
          postConditions,
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
        <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
        <Button>Download file</Button>
      </div>
      <Text variant="Heading035">Step 2: Submit your inscription</Text>
      <Text variant="Body01">
        Once your inscription is created, submit it to the bridge by entering the inscription ID:
      </Text>
      <Input placeholder="Enter your inscription ID" {...inscriptionId.props}></Input>
      <div className="flex">
        <Button onClick={fetchSignature}>Submit</Button>
      </div>
    </div>
  );
};
