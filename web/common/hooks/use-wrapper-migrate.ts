import { useCallback } from 'react';
import { useAtomCallback } from 'jotai/utils';
import { useOpenContractCall } from '@micro-stacks/react';
import { bnsAssetInfoState, bnsContractState, contractsState, tokenAssetInfoState } from '../store';
import {
  migrateNameAssetIdState,
  migrateTxidAtom,
  wrapperContractIdAtom,
  wrapperSignatureAtom,
  recipientAddrAtom,
  validRecipientState,
} from '../store/migration';
import { hexToBytes } from 'micro-stacks/common';
import { stxAddressAtom } from '@store/micro-stacks';
import {
  PostConditionMode,
  makeStandardNonFungiblePostCondition,
  PostConditionType,
  NonFungibleConditionCode,
  makeContractNonFungiblePostCondition,
} from 'micro-stacks/transactions';

export function useWrapperMigrate() {
  const { isRequestPending, openContractCall } = useOpenContractCall();

  const migrate = useAtomCallback(
    useCallback(
      async (get, set) => {
        const contracts = get(contractsState);
        const migrator = contracts.wrapperMigrator;
        const contractId = get(wrapperContractIdAtom);
        const signature = get(wrapperSignatureAtom);
        const recipient = get(validRecipientState);
        const address = get(stxAddressAtom)!;
        const bnsAsset = get(bnsAssetInfoState);
        const bnsTupleId = get(migrateNameAssetIdState);
        if (!contractId || !signature) {
          console.error('No signature');
          return;
        }
        if (!recipient) {
          console.error('Cannot migrate - no validated recipient');
          return;
        }

        const postCondition = makeStandardNonFungiblePostCondition(
          address,
          NonFungibleConditionCode.DoesNotOwn,
          bnsAsset,
          bnsTupleId
        );
        const [wrapperAddr, wrapperName] = contractId.split('.');
        const wrapperPC = makeContractNonFungiblePostCondition(
          wrapperAddr,
          wrapperName,
          NonFungibleConditionCode.Owns,
          bnsAsset,
          bnsTupleId
        );

        await openContractCall({
          ...migrator.migrate({
            wrapper: contractId,
            signature: hexToBytes(signature),
            recipient: recipient,
          }),
          postConditionMode: PostConditionMode.Deny,
          postConditions: [postCondition, wrapperPC],
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
