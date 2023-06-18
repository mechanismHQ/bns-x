import React from 'react';
import { hashFqn, contracts } from '@bns-x/core';
import { useOpenContractCall } from '@micro-stacks/react';
import { ClarigenClient, contractFactory } from '@clarigen/core';
import { asciiToBytes, hexToBytes, bytesToHex } from 'micro-stacks/common';
import { registerTxAtom, registerTxIdAtom } from '@store/register';
import { useAtomCallback } from 'jotai/utils';
import { makeZoneFile } from '@fungible-systems/zone-file';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { hashRipemd160 } from 'micro-stacks/crypto';
import { networkAtom } from '@store/micro-stacks';
import { PostConditionMode } from 'micro-stacks/transactions';
import { bnsApi } from '@store/api';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';
import { isMainnetState } from '@store/index';

export function useNameRegister(name: string, namespace: string, price: bigint) {
  const { openContractCall, isRequestPending } = useOpenContractCall();
  const { nameRegistrar } = contracts;
  const contract = contractFactory(
    nameRegistrar,
    `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.name-registrar`
  );
  const isMainnet = useAtomValue(isMainnetState);

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
          postConditionMode: PostConditionMode.Allow,
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
