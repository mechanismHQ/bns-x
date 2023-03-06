import { toUnicode } from 'punycode';
import { useMemo } from 'react';

export function usePunycode(str: null): null;
export function usePunycode(str: string): string;
export function usePunycode(str: string | null): string | null;
export function usePunycode(str: string | null): string | null {
  return useMemo(() => {
    if (str === null) return null;
    return toUnicode(str);
  }, [str]);
}
