import React from 'react';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { hashFqn, contracts } from '@bns-x/core';
import { contractFactory } from '@clarigen/core';
import { isMainnetState } from '@store/index';
import { registerTxAtom, registerTxIdAtom } from '@store/register';
import { stxAddressAtom } from '@store/micro-stacks';
import { useOpenContractCall } from '@micro-stacks/react';
import { asciiToBytes, hexToBytes } from 'micro-stacks/common';
import {
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  PostConditionMode,
} from 'micro-stacks/transactions';
import { toast } from 'sonner';

export function useNameRegister(name: string, namespace: string, price: bigint) {
  const stxAddress = useAtomValue(stxAddressAtom);
  const isMainnet = useAtomValue(isMainnetState);
  const { openContractCall, isRequestPending } = useOpenContractCall();
  const { nameRegistrar } = contracts;
  const contract = contractFactory(
    nameRegistrar,
    `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registrar`
  );
  const stxPostCondition = makeStandardSTXPostCondition(
    stxAddress as string,
    FungibleConditionCode.Equal,
    price
  );

  const nameRegister = useAtomCallback(
    React.useCallback(
      async (get, set) => {
        await openContractCall({
          ...contract.nameRegister({
            name: asciiToBytes(name),
            namespace: asciiToBytes(namespace),
            amount: Number(price),
            hashedFqn: hashFqn(name, namespace, '00'),
            salt: hexToBytes('00'),
          }),
          postConditionMode: PostConditionMode.Deny,
          postConditions: [stxPostCondition],
          async onCancel() {
            console.log('Cancelled tx');
          },
          async onFinish(payload) {
            const txUrl = isMainnet
              ? `https://explorer.hiro.so/txid/${payload.txId}`
              : `http://localhost:8000/txid/${payload.txId}`;
            set(registerTxIdAtom, payload.txId);
            toast('Transaction submitted', {
              duration: 10000,
              action: {
                label: 'View transaction',
                onClick: () => window.open(txUrl, '_blank'),
              },
            });
          },
        });
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
