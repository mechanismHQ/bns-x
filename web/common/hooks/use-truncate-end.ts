import { truncateEnd } from '@common/utils';
import { useMemo } from 'react';

export function useTruncateEnd(str: string, maxSize: number) {
  return useMemo(() => {
    return truncateEnd(str, maxSize);
  }, [str, maxSize]);
}
