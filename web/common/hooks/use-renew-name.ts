import type { ContractCallTyped, TypedAbiArg } from '@clarigen/core';
import { getContractsClient } from '@common/constants';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import { currentAccountAtom, networkAtom } from '@store/micro-stacks';
import { nameDetailsAtom, namePriceState } from '@store/names';
import { loadable, useAtomCallback, waitForAll } from 'jotai/utils';
import { useCallback, useEffect } from 'react';
import { nameToTupleBytes } from '@common/utils';
import { hexToBytes } from 'micro-stacks/common';
import { atom, useAtom, useAtomValue } from 'jotai';
import { renewalTxidAtom } from '@store/profile';

export function useRenewName(name: string) {
  const { isRequestPending, openContractCall } = useAccountOpenContractCall();
  const [txid, setTxid] = useAtom(renewalTxidAtom);

  // prefetch async
  useAtomValue(loadable(namePriceState(name)));

  useEffect(() => {
    setTxid('');
  }, [setTxid]);

  const renew = useAtomCallback(
    useCallback(
      async (get, set) => {
        const [details, price] = get(waitForAll([nameDetailsAtom(name), namePriceState(name)]));
        const account = get(currentAccountAtom);
        if (!details || !account) return;
        let tx: ContractCallTyped<TypedAbiArg<unknown, string>[], any>;
        if (details.isBnsx) {
          const wrapperId = details.wrapper;
          const wrapperContract = getContractsClient().nameWrapper(wrapperId);
          tx = wrapperContract.nameRenewal({
            stxToBurn: price,
          });
        } else {
          const zonefileHash = details.zonefile_hash ? hexToBytes(details.zonefile_hash) : null;
          tx = getContractsClient().bnsCore.nameRenewal({
            ...nameToTupleBytes(name),
            stxToBurn: price,
            newOwner: null,
            zonefileHash,
          });
        }

        await openContractCall({
          ...tx,
          onFinish(payload) {
            set(renewalTxidAtom, payload.txId);
          },
        });
      },
      [name, openContractCall]
    )
  );

  return {
    isRequestPending,
    txid,
    renew,
  };
}
