import type { AccountProgressData } from '@store/accounts';
import { accountProgressStorageAtom } from '@store/accounts';
import { accountProgressAtom } from '@store/accounts';
import { currentAccountProgressAtom } from '@store/accounts';
import type { Account } from '@store/micro-stacks';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

export function useMigrationProgress(account: Account) {
  const saveWrapperTxid = useAtomCallback(
    useCallback(
      (get, set, txid: string) => {
        console.log('account?.stxAddress', account?.stxAddress);
        const atom = account?.stxAddress
          ? accountProgressStorageAtom(account.stxAddress)
          : currentAccountProgressAtom;
        const prev = get(atom);
        set(atom, {
          name: prev?.name,
          wrapperTxid: txid,
        });
      },
      [account?.stxAddress]
    )
  );

  const saveFinalizeTxid = useAtomCallback(
    useCallback(
      (get, set, txid: string) => {
        const atom = account?.stxAddress
          ? accountProgressStorageAtom(account.stxAddress)
          : currentAccountProgressAtom;
        const prev = get(atom);
        console.log('account?.stxAddress', account?.stxAddress);
        set(atom, {
          ...prev,
          migrationTxid: txid,
        });
      },
      [account?.stxAddress]
    )
  );

  return {
    saveFinalizeTxid,
    saveWrapperTxid,
  };
}
