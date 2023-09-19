import React from 'react';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { hashFqn, randomSalt } from '@bns-x/core';
import { networkAtom } from '@store/micro-stacks';
import { contractsState } from '@store/index';
import { registrationTxAtom, registerTxIdAtom, nameBeingRegisteredAtom } from '@store/register';
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
import { toPunycode } from '@bns-x/punycode';

export function useNameRegister(name: string, namespace: string, price: bigint) {
  const { openContractCall, isRequestPending } = useAccountOpenContractCall();

  const nameRegister = useAtomCallback(
    React.useCallback(
      async (get, set) => {
        try {
          set(nameBeingRegisteredAtom, `${name}.${namespace}`);
          const contracts = get(contractsState);
          const nameRegistrar = contracts.nameRegistrar;
          const network = get(networkAtom);
          const stxAddress = get(stxAddressAtom);
          const stxPostCondition = makeStandardSTXPostCondition(
            stxAddress as string,
            FungibleConditionCode.Equal,
            price
          );
          const namePuny = toPunycode(name);
          await openContractCall({
            ...nameRegistrar.nameRegister({
              name: asciiToBytes(namePuny),
              namespace: asciiToBytes(namespace),
              amount: Number(price),
              hashedFqn: hashFqn(name, namespace, hexToBytes('00')), // TODO: get `randomSalt()` function to work for both pre-order and register
              salt: hexToBytes('00'),
            }),
            postConditionMode: PostConditionMode.Deny,
            postConditions: [stxPostCondition],
            onCancel() {
              console.log('Cancelled tx');
            },
            onFinish(payload) {
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
    registerTxIdAtom,
    isRequestPending,
  };
}
