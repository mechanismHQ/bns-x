import { atom } from 'jotai';
import { atomWithHash } from 'jotai-location';
import { tupleCV, bufferCV } from 'micro-stacks/clarity';
import { asciiToBytes } from 'micro-stacks/common';

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

export const migrateNameAssetIdState = atom(get => {
  const nameStr = get(migrateNameAtom);
  if (!nameStr) throw new Error('Cannot get BNS name asset - empty');
  const [name, namespace] = nameStr.split('.');
  return tupleCV({
    name: bufferCV(asciiToBytes(name)),
    namespace: bufferCV(asciiToBytes(namespace)),
  });
});
