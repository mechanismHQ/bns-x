import { accountProgressAtom, accountProgressStorageAtom } from '@store/accounts';
import { addressCoreNameAtom } from '@store/names';
import { useAtom, useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import { useEffect } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

export function useMonitorProgress(address: string) {
  const [progress, setProgress] = useAtom(accountProgressStorageAtom(address));
  const coreName = useAtomValue(loadable(addressCoreNameAtom(address)));

  useDeepCompareEffect(() => {
    if (coreName.state !== 'hasData') return;
    const name = coreName.data;
    if (name && progress.name !== name) {
      setProgress({ name });
    }
    if (typeof progress.name === 'undefined' && name) {
      setProgress(prev => ({ ...prev, name }));
    }
  }, [coreName, progress]);
}
