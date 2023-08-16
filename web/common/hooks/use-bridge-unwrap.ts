import { useCallback } from 'react';
import { useAtomCallback } from 'jotai/utils';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import { useRouter } from 'next/router';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import {
  bridgeUnwrapTxidAtom,
  fetchUnwrapSignature,
  inscriptionIdForNameAtom,
} from '@store/bridge';
import { nameDetailsAtom } from '@store/names';
import { bridgeContractState, bridgeRegistryContractState, nameRegistryState } from '@store/index';
import { inscriptionIdToBytes } from '@bns-x/bridge';
import { hexToBytes } from 'micro-stacks/common';
import { makeNonFungiblePostCondition } from '@clarigen/core';
import { NonFungibleConditionCode } from 'micro-stacks/transactions';
import { lv } from 'date-fns/locale';

export function useBridgeUnwrap() {
  const router = useRouter();
  const name = router.query.name as string;
  const { openContractCall } = useAccountOpenContractCall();

  const unwrap = useAtomCallback(
    useCallback(
      async (get, set) => {
        const address = get(stxAddressAtom);
        const inscriptionId = get(inscriptionIdForNameAtom(name));
        if (!address) throw new Error('Unable to unwrap, logged out.');
        if (!inscriptionId) throw new Error('Unable to unwrap, no inscription id.');
        const { signature } = await fetchUnwrapSignature({ inscriptionId });
        console.log('signature', signature);
        const bridge = get(bridgeContractState);
        const bnsx = get(nameRegistryState);
        const registry = get(bridgeRegistryContractState);
        const nameDetails = get(nameDetailsAtom(name))!;
        if (!nameDetails.isBnsx) throw new Error('Unreachable state: not bnsx');
        const bnsxPostCondition = makeNonFungiblePostCondition(
          bnsx,
          registry.identifier,
          NonFungibleConditionCode.DoesNotOwn,
          BigInt(nameDetails.id)
        );
        const recipientBnsxPostCondition = makeNonFungiblePostCondition(
          bnsx,
          address,
          NonFungibleConditionCode.Owns,
          BigInt(nameDetails.id)
        );

        // TODO: post conditions
        const tx = bridge.bridgeToL2({
          inscriptionId: inscriptionIdToBytes(inscriptionId),
          signature: hexToBytes(signature),
          recipient: address,
        });
        // const network = get(networkAtom);
        await openContractCall({
          ...tx,
          postConditions: [bnsxPostCondition, recipientBnsxPostCondition],
          // network,
          onFinish(payload) {
            set(bridgeUnwrapTxidAtom, payload.txId);
          },
        });
      },
      [openContractCall, name]
    )
  );

  return {
    unwrap,
  };
}
