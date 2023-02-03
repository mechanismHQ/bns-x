import { fetchTypedTransaction } from '../stacks-api';
// import { contracts } from '../clarigen';
import { useNetwork } from '@micro-stacks/react';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { txidQueryAtom } from '@store/migration';

export function useTxStatus(txidAtom: Atom<string | undefined>) {
  const [txAtom] = txidQueryAtom(txidAtom);
  const status = useAtomValue(txAtom);

  return status;
}
