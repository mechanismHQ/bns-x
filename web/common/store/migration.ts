import { atom } from 'jotai';
import { atomWithHash } from 'jotai-location';
import { tupleCV, bufferCV } from 'micro-stacks/clarity';
import { asciiToBytes } from 'micro-stacks/common';
import { atomsWithQuery } from 'jotai-tanstack-query';
import type { Atom } from 'jotai';
import { PrimitiveAtom } from 'jotai';
import { networkAtom, stxAddressAtom } from '@store/micro-stacks';
import { fetchTransaction } from '@common/stacks-api';
import { validateStacksAddress } from 'micro-stacks/crypto';
import { bnsContractState, clarigenAtom, nameRegistryState } from '@store/index';
import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import { getContractParts, nameToTupleBytes } from '@common/utils';
import { currentUserV1NameState } from '@store/names';

export function hashAtom(name: string, defaultValue?: string) {
  return typeof window === 'undefined'
    ? atom<string | undefined>(defaultValue)
    : atomWithHash<string | undefined>(name, defaultValue);
}

export const wrapperDeployTxidAtom = hashAtom('deployTx');

export const migrateTxidAtom = hashAtom('migrateTxid');

export const migrateNameAtom = hashAtom('name');

export const nameUpgradingAtom = atom(get => {
  const cacheName = get(migrateNameAtom);
  const fromQuery = get(currentUserV1NameState);
  if (cacheName) return cacheName;
  return fromQuery?.combined ?? null;
});

export const migrateNameAssetIdState = atom(get => {
  const nameStr = get(migrateNameAtom);
  if (!nameStr) throw new Error('Cannot get BNS name asset - empty');
  return nameToTupleBytes(nameStr);
});

export function txidQueryAtom(txidAtom: Atom<string | undefined>, unanchored = true) {
  return atomsWithQuery<MempoolTransaction | Transaction | null>(get => ({
    queryKey: ['txid-query', get(txidAtom) || ''],
    refetchInterval: data => {
      if (data) {
        if (data.tx_status === 'pending') return 5000;
        if (data.tx_status === 'success') {
          return data.is_unanchored ? 5000 : false;
        }
        return false;
      }
      return 5000;
    },
    queryFn: async () => {
      const txid = get(txidAtom);
      const network = get(networkAtom);
      if (!txid) return Promise.resolve(null);
      try {
        const tx = await fetchTransaction({
          url: network.getCoreApiUrl(),
          unanchored,
          txid,
        });
        return tx;
      } catch (error) {
        return null;
      }
    },
  }));
}

export const [migrateTxState] = txidQueryAtom(migrateTxidAtom);

export const [wrapperDeployTxState] = txidQueryAtom(wrapperDeployTxidAtom);

export const wrapperContractIdState = atom(get => {
  const tx = get(wrapperDeployTxState);
  if (tx === null) return null;
  if (tx.tx_status !== 'success') return null;
  if (tx.tx_type !== 'smart_contract') return null;
  return tx.smart_contract.contract_id;
});

export const [wrapperSignatureState] = atomsWithQuery<string | null>(get => {
  const deployTxid = get(wrapperDeployTxidAtom);
  // const wrapperDeploy = get(wrapperDeployTxState);
  const wrapperId = get(wrapperContractIdState);
  return {
    queryKey: ['wrapper-sig-state', wrapperId, deployTxid],
    refetchInterval(data, query) {
      const [_, id] = query.queryKey;
      if (id === null) return false;
      if (typeof data === 'string') return false;

      return 5000;
    },
    queryFn: async () => {
      if (!deployTxid) return null;
      if (wrapperId === null) return null;

      try {
        const res = await fetch(`/api/wrapper-sig?wrapper=${deployTxid}`);
        if (!res.ok) {
          return null;
        }
        const data = (await res.json()) as { signature: string; contractId: string };
        return data.signature;
      } catch (error) {
        return null;
      }
    },
  };
});

function standardPrincipalOnly(address: string) {
  if (address.includes('.')) {
    return null;
  }
  return address;
}

export function makeBnsRecipientState() {
  const sendElsewhereAtom = atom(false);
  const upgradeRecipientAtom = atom('');

  const recipientAddrAtom = atom<string | null>(null);

  const [validRecipientState] = atomsWithQuery<string | null>(get => ({
    queryKey: ['valid-recipient', get(upgradeRecipientAtom), get(sendElsewhereAtom)],
    queryFn: async () => {
      const recipient = get(upgradeRecipientAtom).trim();
      const sendElsewhere = get(sendElsewhereAtom);
      if (!sendElsewhere) {
        const me = get(stxAddressAtom);
        return me || null;
      }
      if (!recipient) return null;
      if (!recipient.includes('.')) {
        return validateStacksAddress(recipient) ? recipient : null;
      }
      const clarigen = get(clarigenAtom);
      const registry = get(nameRegistryState);
      const bns = get(bnsContractState);
      const [nameStr, namespaceStr] = getContractParts(recipient);
      console.log(`Fetching addr for BNS name ${nameStr}.${namespaceStr}`);
      const name = asciiToBytes(nameStr);
      const namespace = asciiToBytes(namespaceStr);

      const [xName, v1Name] = await Promise.all([
        clarigen.ro(registry.getNameProperties({ name, namespace })),
        clarigen.ro(bns.nameResolve({ name, namespace })),
      ]);
      if (xName !== null) {
        console.log(`Setting recipient from BNSx: ${xName.owner}`);
        return standardPrincipalOnly(xName.owner);
      }
      if (v1Name.isOk) {
        console.log(`Setting name from v1 to addr`, v1Name.value.owner);
        return standardPrincipalOnly(v1Name.value.owner);
      }
      return null;
    },
  }));

  const recipientIsBnsState = atom(get => {
    const sendElsewhere = get(sendElsewhereAtom);
    const inputBNS = get(upgradeRecipientAtom).split('.').length === 2;
    return sendElsewhere && inputBNS;
  });

  return {
    sendElsewhereAtom,
    upgradeRecipientAtom,
    recipientAddrAtom,
    validRecipientState,
    recipientIsBnsState,
  };
}

export const migrateRecipientState = makeBnsRecipientState();

export type BnsRecipientState = ReturnType<typeof makeBnsRecipientState>;
