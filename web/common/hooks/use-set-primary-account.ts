import {
  clientAtom,
  microStacksStoreAtom,
  overridePrimaryAccountIndexAtom,
} from '@store/micro-stacks';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

export function useSetPrimaryAccount() {
  const setPrimary = useAtomCallback(
    useCallback(async (get, set, index: number) => {
      const client = get(clientAtom);
      const store = get(microStacksStoreAtom);

      set(overridePrimaryAccountIndexAtom, index);
      store.setState(() => ({
        currentAccountIndex: index,
      }));
      await client?.persist();
    }, [])
  );

  return { setPrimary };
}
