import { useCallback } from 'react';
import { useAtomCallback } from 'jotai/utils';
import { useOpenContractCall } from '@micro-stacks/react';
import { bnsContractState, contractsState } from '../store';
import {
  migrateNameAssetIdState,
  migrateTxidAtom,
  wrapperSignatureState,
  wrapperContractIdState,
  migrateRecipientState,
} from '@store/migration';
import { hexToBytes } from 'micro-stacks/common';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { PostConditionMode, NonFungibleConditionCode } from 'micro-stacks/transactions';
import { makeNonFungiblePostCondition } from '@clarigen/core';

export function useWrapperMigrate() {
  const { isRequestPending, openContractCall } = useOpenContractCall();

  const migrate = useAtomCallback(
    useCallback(
      async (get, set) => {
        const contracts = get(contractsState);
        const migrator = contracts.wrapperMigrator;
        const contractId = get(wrapperContractIdState);
        const signature = get(wrapperSignatureState);
        const recipient = get(migrateRecipientState.validRecipientState);
        const address = get(stxAddressAtom)!;
        const bns = get(bnsContractState);
        const bnsTupleId = get(migrateNameAssetIdState);
        const network = get(networkAtom);
        if (!contractId || !signature) {
          console.error('No signature');
          return;
        }
        if (!recipient) {
          console.error('Cannot migrate - no validated recipient');
          return;
        }

        const postCondition = makeNonFungiblePostCondition(
          bns,
          address,
          NonFungibleConditionCode.DoesNotOwn,
          bnsTupleId
        );

        await openContractCall({
          ...migrator.migrate({
            wrapper: contractId,
            signature: hexToBytes(signature),
            recipient: recipient,
          }),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          network: {
            ...network,
            coreApiUrl: network.getCoreApiUrl(),
          },
          postConditionMode: PostConditionMode.Deny,
          postConditions: [postCondition],
          onFinish(payload) {
            set(migrateTxidAtom, payload.txId);
          },
        });
      },
      [openContractCall]
    )
  );

  return {
    migrate,
    isRequestPending,
  };
}
