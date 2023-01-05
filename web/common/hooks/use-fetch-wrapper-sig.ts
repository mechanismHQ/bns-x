import { useCallback } from 'react';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import {
  wrapperContractIdAtom,
  wrapperDeployTxidAtom,
  wrapperSignatureAtom,
} from '../store/migration';
import { atom } from 'jotai';

const fetchWrapperPendingAtom = atom(false);

export function useFetchWrapperSig() {
  const contractId = useAtomValue(wrapperContractIdAtom);
  const signature = useAtomValue(wrapperSignatureAtom);
  const isFetchPending = useAtomValue(fetchWrapperPendingAtom);

  const fetchSig = useAtomCallback(
    useCallback(async (get, set) => {
      const deployTxid = get(wrapperDeployTxidAtom);
      if (!deployTxid) {
        console.error('Unable to get signature without wrapper txid');
        return;
      }
      set(fetchWrapperPendingAtom, true);
      const res = await fetch(`/api/wrapper-sig?wrapper=${deployTxid}`);
      const data = (await res.json()) as { signature: string; contractId: string };

      set(wrapperSignatureAtom, data.signature);
      set(wrapperContractIdAtom, data.contractId);
      set(fetchWrapperPendingAtom, false);
    }, [])
  );

  return {
    fetchSig,
    contractId,
    signature,
    isFetchPending,
  };
}
