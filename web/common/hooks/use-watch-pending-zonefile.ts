import {
  nameUpdateTxAtom,
  nameUpdateTxidConfirmedAtom,
  pendingZonefileState,
  zonefileUpdateConfirmedState,
} from '@store/profile';
import { useAtomValue } from 'jotai';
import { useAtomCallback, RESET } from 'jotai/utils';
import { useCallback, useEffect, useMemo } from 'react';

export function useWatchPendingZonefile() {
  const updateTx = useAtomValue(nameUpdateTxAtom);

  const isTxFinished = useMemo(() => {
    if (updateTx === null || updateTx.tx_status === 'pending') return false;
    if ('canonical' in updateTx) {
      if (updateTx.canonical === false) return false;
    }
    if ('is_unanchored' in updateTx) {
      return updateTx.is_unanchored === false;
    }
  }, [updateTx]);

  const clearPending = useAtomCallback(
    useCallback((get, set) => {
      console.debug('Clearing pending zonefile.');
      const pending = get(pendingZonefileState);
      if (pending?.txid) {
        set(nameUpdateTxidConfirmedAtom, pending.txid);
      }
      set(pendingZonefileState, RESET);
    }, [])
  );

  useEffect(() => {
    if (isTxFinished) {
      void clearPending();
    }
  }, [isTxFinished, clearPending]);
}
