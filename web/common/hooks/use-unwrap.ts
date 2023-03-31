import { useOpenContractCall } from '@micro-stacks/react';
import { nameDetailsAtom } from '@store/names';
import { loadable, useAtomCallback } from 'jotai/utils';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { getContractsClient } from '@common/constants';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { NonFungibleConditionCode } from 'micro-stacks/transactions';
import { bnsContractState, nameRegistryState } from '@store/index';
import { unwrapTxidAtom } from '@store/profile';
import { nameToTupleBytes } from '@common/utils';
import { makeNonFungiblePostCondition } from '@clarigen/core';
import { makeBnsRecipientState } from '@store/migration';

export const unwrapRecipientState = makeBnsRecipientState();

export function useUnwrap(name: string) {
  const { openContractCall, isRequestPending } = useOpenContractCall();
  const unwrapTxid = useAtomValue(unwrapTxidAtom);
  const recipientAddress = useAtomValue(loadable(unwrapRecipientState.validRecipientState));

  const canUnwrap = useMemo(() => {
    if (recipientAddress.state !== 'hasData') return false;
    return !!recipientAddress.data;
  }, [recipientAddress]);

  const unwrap = useAtomCallback(
    useCallback(
      async (get, set) => {
        const nameDetails = get(nameDetailsAtom(name));
        const sender = get(stxAddressAtom);
        if (nameDetails === null || typeof sender === 'undefined' || !nameDetails.isBnsx) {
          throw new Error('No name details found.');
        }
        const wrapper = nameDetails.wrapper;
        const wrapperContract = getContractsClient().nameWrapper(wrapper);
        const network = get(networkAtom);
        const registry = get(nameRegistryState);
        const bns = get(bnsContractState);
        const bnsAssetId = nameToTupleBytes(name);
        const recipient = get(unwrapRecipientState.validRecipientState);
        if (!recipient) {
          console.warn('Cannot unwrap - no valid recipient.');
          return;
        }

        // Burn BNSx
        const bnsxPostCondition = makeNonFungiblePostCondition(
          registry,
          sender,
          NonFungibleConditionCode.DoesNotOwn,
          BigInt(nameDetails.id)
        );
        // Send BNS from wrapper
        const bnsPostCondition = makeNonFungiblePostCondition(
          bns,
          wrapper,
          NonFungibleConditionCode.DoesNotOwn,
          bnsAssetId
        );
        // User receives BNS
        const receiveBnsPostCondition = makeNonFungiblePostCondition(
          bns,
          recipient,
          NonFungibleConditionCode.Owns,
          bnsAssetId
        );

        await openContractCall({
          ...wrapperContract.unwrap({
            recipient,
          }),
          postConditions: [bnsxPostCondition, bnsPostCondition, receiveBnsPostCondition],
          onFinish(data) {
            set(unwrapTxidAtom, data.txId);
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          network: {
            ...network,
            coreApiUrl: network.getCoreApiUrl(),
          },
        });
      },
      [name, openContractCall]
    )
  );

  return {
    unwrap,
    unwrapTxid,
    isRequestPending,
    canUnwrap,
  };
}
