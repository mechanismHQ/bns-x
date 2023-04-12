import { useMemo } from 'react';
import { useDeepCompareMemoize } from 'use-deep-compare-effect';

export function useDeepMemo<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, useDeepCompareMemoize(deps));
}
