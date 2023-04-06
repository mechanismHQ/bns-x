import type { Account } from '@store/micro-stacks';
import { accountsInnerAtom, clientAtom, microStacksStoreAtom } from '@store/micro-stacks';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

export function useRemoveAccount() {
  const removeAccount = useAtomCallback(
    useCallback(async (get, set, account: Account) => {
      const accounts = get(accountsInnerAtom);
      const [_, addrHash] = account.address;
      const newAccounts = accounts.filter(a => a.address[1] !== addrHash);
      const store = get(microStacksStoreAtom);
      const client = get(clientAtom);

      store.setState(s => ({ ...s, accounts: newAccounts }));

      await client?.persist();
    }, [])
  );

  return { removeAccount };
}
