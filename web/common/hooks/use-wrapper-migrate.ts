import { useCallback } from 'react';
import { useAtomCallback } from 'jotai/utils';
import { useOpenContractCall } from '@micro-stacks/react';
import { bnsContractState, contractsState } from '../store';
import {
  migrateNameAssetIdState,
  wrapperSignatureState,
  wrapperContractIdState,
  migrateRecipientState,
} from '@store/migration';
import { hexToBytes } from 'micro-stacks/common';
import type { Account } from '@store/micro-stacks';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { PostConditionMode, NonFungibleConditionCode } from 'micro-stacks/transactions';
import { makeNonFungiblePostCondition } from '@clarigen/core';
import { useMigrationProgress } from '@common/hooks/use-migration-progress';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';

export function useWrapperMigrate(_account?: Account) {
  const { isRequestPending, openContractCall, account } = useAccountOpenContractCall(_account);
  const { saveFinalizeTxid } = useMigrationProgress(account!);

  const migrate = useAtomCallback(
    useCallback(
      async (get, _set) => {
        const contracts = get(contractsState);
        const migrator = contracts.wrapperMigrator;
        const contractId = get(wrapperContractIdState);
        const signature = get(wrapperSignatureState);
        const recipient = get(migrateRecipientState);
        const address = account?.stxAddress;
        const bns = get(bnsContractState);
        const bnsTupleId = get(migrateNameAssetIdState);
        const network = get(networkAtom);
        if (!contractId || !signature || !address) {
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
          async onFinish(payload) {
            await saveFinalizeTxid(payload.txId);
          },
        });
      },
      [openContractCall, saveFinalizeTxid, account?.stxAddress]
    )
  );

  return {
    migrate,
    isRequestPending,
  };
}
