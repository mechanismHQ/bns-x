import type { AccountProgressData } from '@store/accounts';
import { currentAccountProgressAtom } from '@store/accounts';
import { accountProgressStorageAtom } from '@store/accounts';
import { accountProgressFileQueryKey } from '@store/accounts';
import { saveProgressFile } from '@store/accounts';
import { currentAccountAtom, stxAddressAtom } from '@store/micro-stacks';
import { nameUpgradingAtom } from '@store/migration';
import { queryClientAtom } from 'jotai-tanstack-query';
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

  return {
    saveProgress,
  };
}
