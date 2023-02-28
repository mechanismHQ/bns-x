import { useOpenContractCall } from '@micro-stacks/react';
import { nameDetailsAtom } from '@store/names';
import { useAtomCallback } from 'jotai/utils';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';
import { getContractsClient } from '@common/constants';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import {
  makeContractNonFungiblePostCondition,
  makeStandardNonFungiblePostCondition,
  NonFungibleConditionCode,
} from 'micro-stacks/transactions';
import { bnsAssetInfoState, bnsxAssetInfoState, nameRegistryState } from '@store/index';
import { uintCV } from 'micro-stacks/clarity';
import { unwrapTxidAtom } from '@store/profile';
import { getContractParts, nameToTupleCV } from '@common/utils';

export function useUnwrap(name: string) {
  const { openContractCall, isRequestPending } = useOpenContractCall();
  const unwrapTxid = useAtomValue(unwrapTxidAtom);

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
        const assetInfo = get(bnsxAssetInfoState);
        const network = get(networkAtom);
        const bnsAsset = get(bnsAssetInfoState);
        const bnsAssetId = nameToTupleCV(name);

        const postCondition = makeStandardNonFungiblePostCondition(
          sender,
          NonFungibleConditionCode.DoesNotOwn,
          assetInfo,
          uintCV(nameDetails.id)
        );
        const [wrapperAddr, wrapperName] = getContractParts(wrapper);
        const bnsPostCondition = makeContractNonFungiblePostCondition(
          wrapperAddr,
          wrapperName,
          NonFungibleConditionCode.DoesNotOwn,
          bnsAsset,
          bnsAssetId
        );
        const receiveBnsPostCondition = makeStandardNonFungiblePostCondition(
          sender,
          NonFungibleConditionCode.Owns,
          bnsAsset,
          bnsAssetId
        );

        await openContractCall({
          ...wrapperContract.unwrap({
            recipient: sender,
          }),
          postConditions: [postCondition, bnsPostCondition, receiveBnsPostCondition],
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
  };
}
