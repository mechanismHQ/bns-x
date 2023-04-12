import type { AccountProgressData } from '@store/accounts';
import { currentAccountProgressAtom } from '@store/accounts';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

export function useMigrationProgress() {
  const saveProgress = useAtomCallback(
    useCallback((get, set, data: AccountProgressData) => {
      const prev = get(currentAccountProgressAtom);
      set(currentAccountProgressAtom, {
        ...prev,
        ...data,
      });
      // const account = get(currentAccountAtom);
      // const address = get(stxAddressAtom);
      // const name = get(nameUpgradingAtom);
      // const client = get(queryClientAtom);
      // if (!account) return;
      // set(accountProgressStorageAtom({ account }), prev => ({
      //   ...prev,
      //   ...data,
      // }));
      // if (!name) throw new Error('No name to save progress for');
      // await saveProgressFile({ appPrivateKey: account.appPrivateKey!, data });
      // client.setQueryData(accountProgressFileQueryKey({ account }), data);
    }, [])
  );

  const saveWrapperTxid = useAtomCallback(
    useCallback((get, set, txid: string) => {
      const prev = get(currentAccountProgressAtom);
      set(currentAccountProgressAtom, {
        name: prev?.name,
        wrapperTxid: txid,
      });
    }, [])
  );

  const saveFinalizeTxid = useAtomCallback(
    useCallback((get, set, txid: string) => {
      const prev = get(currentAccountProgressAtom);
      set(currentAccountProgressAtom, {
        ...prev,
        migrationTxid: txid,
      });
    }, [])
  );

  return {
    saveProgress,
    saveFinalizeTxid,
    saveWrapperTxid,
  };
}
