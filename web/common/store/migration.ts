import { atom } from 'jotai';
import { atomWithHash } from 'jotai-location';
import { tupleCV, bufferCV } from 'micro-stacks/clarity';
import { asciiToBytes } from 'micro-stacks/common';
import { atomsWithQuery } from 'jotai-tanstack-query';
import { Atom, PrimitiveAtom } from 'jotai';
import { networkAtom, stxAddressAtom } from '@micro-stacks/jotai';
import { fetchTransaction } from '@common/stacks-api';
import { validateStacksAddress } from 'micro-stacks/crypto';
import { bnsContractState, clarigenAtom, nameRegistryState } from '@store/index';

function hashAtom(name: string) {
  return typeof window === 'undefined'
    ? atom<string | undefined>(undefined)
    : atomWithHash<string | undefined>(name, undefined);
}

export const wrapperDeployTxidAtom = hashAtom('deployTx');

export const wrapperSignatureAtom = hashAtom('wrapperSig');

export const wrapperContractIdAtom = hashAtom('wrapperId');

export const migrateTxidAtom = hashAtom('migrateTxid');

export const migrateNameAtom = hashAtom('name');

export const upgradeRecipientAtom = atom('');

export const recipientAddrAtom = atom<string | null>(null);

export const migrateNameAssetIdState = atom(get => {
  const nameStr = get(migrateNameAtom);
  if (!nameStr) throw new Error('Cannot get BNS name asset - empty');
  const [name, namespace] = nameStr.split('.');
  return tupleCV({
    name: bufferCV(asciiToBytes(name)),
    namespace: bufferCV(asciiToBytes(namespace)),
  });
});

export function txidQueryAtom(txidAtom: Atom<string | undefined>) {
  return atomsWithQuery(get => ({
    queryKey: ['txid-query', get(txidAtom) || ''],
    queryFn: async () => {
      const txid = get(txidAtom);
      const network = get(networkAtom);
      if (!txid) return Promise.resolve(null);
      const tx = await fetchTransaction({
        url: network.getCoreApiUrl(),
        unanchored: true,
        txid,
      });
      return tx;
    },
  }));
}

export const [migrateTxState] = txidQueryAtom(migrateTxidAtom);

export const [validRecipientState] = atomsWithQuery<string | null>(get => ({
  queryKey: ['valid-recipient', get(upgradeRecipientAtom)],
  queryFn: async () => {
    const recipient = get(upgradeRecipientAtom).trim();
    if (!recipient) {
      const self = get(stxAddressAtom);
      return self || null;
    }
    if ((recipient.startsWith('SP') || recipient.startsWith('ST')) && !recipient.includes('.')) {
      return validateStacksAddress(recipient) ? recipient : null;
    }
    const network = get(networkAtom);
    const clarigen = get(clarigenAtom);
    const registry = get(nameRegistryState);
    const bns = get(bnsContractState);
    const [nameStr, namespaceStr] = recipient.split('.');
    const name = asciiToBytes(nameStr);
    const namespace = asciiToBytes(namespaceStr);

    const [xName, v1Name] = await Promise.all([
      clarigen.ro(registry.getNameProperties({ name, namespace })),
      clarigen.ro(bns.nameResolve({ name, namespace })),
    ]);
    if (xName !== null) {
      return xName.owner;
    }
    if (v1Name.isOk) {
      return v1Name.value.owner;
    }
    return null;
  },
}));
