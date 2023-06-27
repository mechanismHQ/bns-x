import React from 'react';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { hashFqn, randomSalt } from '@bns-x/core';
import { networkAtom } from '@store/micro-stacks';
import { contractsState } from '@store/index';
import { registerTxAtom, registerTxIdAtom } from '@store/register';
import { getTxUrl } from '@common/utils';
import { useAccountOpenContractCall } from '@common/hooks/use-account-open-contract-call';
import { stxAddressAtom } from '@store/micro-stacks';
import { asciiToBytes, hexToBytes } from 'micro-stacks/common';
import {
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  PostConditionMode,
} from 'micro-stacks/transactions';
import { toast } from 'sonner';

export function useNameRegister(name: string, namespace: string, price: bigint) {
  const network = useAtomValue(networkAtom);
  const stxAddress = useAtomValue(stxAddressAtom);
  const { openContractCall, isRequestPending } = useAccountOpenContractCall();
  const stxPostCondition = makeStandardSTXPostCondition(
    stxAddress as string,
    FungibleConditionCode.Equal,
    price
  );

  const nameRegister = useAtomCallback(
    React.useCallback(
      async (get, set) => {
        try {
          const contracts = get(contractsState) as any; // TODO: fix typing: getting a possibly undefined error when pulling in nameRegistrar contract only
          const nameRegistrar = contracts.nameRegistrar;
          await openContractCall({
            ...nameRegistrar.nameRegister({
              name: asciiToBytes(name),
              namespace: asciiToBytes(namespace),
              amount: Number(price),
              hashedFqn: hashFqn(name, namespace, hexToBytes('00')), // TODO: get `randomSalt()` function to work for both pre-order and register
              salt: hexToBytes('00'),
            }),
            postConditionMode: PostConditionMode.Deny,
            postConditions: [stxPostCondition],
            async onCancel() {
              console.log('Cancelled tx');
            },
            async onFinish(payload) {
              const url = getTxUrl(payload.txId, network);
              set(registerTxIdAtom, payload.txId);
              toast('Transaction submitted', {
                duration: 10000,
                action: {
                  label: 'View transaction',
                  onClick: () => window.open(url, '_blank'),
                },
              });
            },
          });
        } catch {
          toast('Error submitting transaction');
        }
      },
      [name, namespace, price, openContractCall]
    )
  );

  return {
    nameRegister,
    registerTxAtom,
    isRequestPending,
  };
}
