import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAtom, useAtomValue } from 'jotai';
import { loadable, useAtomCallback } from 'jotai/utils';
import {
  bridgeInscriptionIdAtom,
  bridgeWrapErrorAtom,
  bridgeWrapLoadingAtom,
  bridgeWrapTxidAtom,
  fetchSignatureForInscriptionId,
  submittedBridgeInscriptionIdAtom,
} from '@store/bridge';
import { currentAccountAtom, networkAtom } from '@store/micro-stacks';
import { nameDetailsAtom } from '@store/names';
import { parseFqn } from '@bns-x/core';
import { bnsContractState, bridgeContractState, nameRegistryState } from '@store/index';
import { asciiToBytes, hexToBytes } from 'micro-stacks/common';
import type { PostCondition } from 'micro-stacks/transactions';
import { NonFungibleConditionCode, PostConditionMode } from 'micro-stacks/transactions';
import { nameToTupleBytes } from '@common/utils';
import { contractFactory, makeNonFungiblePostCondition } from '@clarigen/core';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import type { ContractCallTyped, TypedAbiArg } from '@clarigen/core';

export function useBridgeWrap() {
  const router = useRouter();
  const name = router.query.name as string;
  const { openContractCall, isRequestPending } = useAccountOpenContractCall();
  const bridgeWrapLoading = useAtomValue(bridgeWrapLoadingAtom);

  const fetchSignature = useAtomCallback(
    useCallback(
      async (get, set) => {
        const currentAccount = get(currentAccountAtom);
        if (!currentAccount) {
          throw new Error('Must be logged in');
        }
        set(bridgeWrapLoadingAtom, true);
        set(bridgeWrapErrorAtom, '');
        const stxAddress = currentAccount.stxAddress;
        const inscriptionId = get(bridgeInscriptionIdAtom);
        const bridgeResponse = await fetchSignatureForInscriptionId({
          inscriptionId,
          fqn: name,
          sender: stxAddress,
        });
        if (bridgeResponse.isErr()) {
          console.debug('Error fetching signature', bridgeResponse.error);
          set(bridgeWrapErrorAtom, bridgeResponse.error);
          set(bridgeWrapLoadingAtom, false);
          return;
        }
        const bridgeData = bridgeResponse.value;
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
        set(submittedBridgeInscriptionIdAtom, inscriptionId);
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
            set(bridgeWrapTxidAtom, payload.txId);
            set(bridgeWrapLoadingAtom, false);
          },
          onCancel() {
            set(bridgeWrapLoadingAtom, false);
          },
        });
      },
      [name, openContractCall]
    )
  );

  return {
    fetchSignature,
    isPending: isRequestPending || bridgeWrapLoading,
  };
}
