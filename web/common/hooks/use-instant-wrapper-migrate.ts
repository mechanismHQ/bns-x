import { useCallback } from 'react';
import { loadable, useAtomCallback } from 'jotai/utils';
import { useOpenContractCall } from '@micro-stacks/react';
import { bnsContractState, contractsState } from '../store';
import {
  migrateNameAssetIdState,
  wrapperSignatureState,
  wrapperContractIdState,
  migrateRecipientState,
  instantFinalizeDataAtom,
} from '@store/migration';
import { hexToBytes } from 'micro-stacks/common';
import type { Account } from '@store/micro-stacks';
import { networkAtom, stxAddressAtom, primaryAccountState } from '@store/micro-stacks';
import { PostConditionMode, NonFungibleConditionCode } from 'micro-stacks/transactions';
import { makeNonFungiblePostCondition } from '@clarigen/core';
import { useMigrationProgress } from '@common/hooks/use-migration-progress';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import { nameToTupleBytes } from '@common/utils';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';
import { useAtomValue } from 'jotai';

export function useWrapperMigrateInstant(_account?: Account) {
  const { isRequestPending, openContractCall, account } = useAccountOpenContractCall(_account);
  const { saveFinalizeTxid } = useMigrationProgress(account!);
  useAtomValue(loadable(instantFinalizeDataAtom(account!)));

  const migrate = useAtomCallback(
    useCallback(async (get, _set) => {
      try {
        const migrationData = get(instantFinalizeDataAtom(account!));
        const contracts = get(contractsState);
        const migrator = contracts.wrapperMigrator;
        if (!migrationData) {
          console.error('No migration data');
          return;
        }
        const contractId = migrationData.contractId;
        const signature = migrationData.signature;
        const recipient = migrationData.recipient;
        const address = account?.stxAddress;
        const bns = get(bnsContractState);
        const bnsTupleId = nameToTupleBytes(migrationData.name);
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
      } catch (error) {
        console.error(error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, useDeepCompareMemoize([account, openContractCall, saveFinalizeTxid]))
  );

  return {
    migrate,
    isRequestPending,
  };
}
