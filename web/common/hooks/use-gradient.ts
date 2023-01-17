import { useMemo } from 'react';
import randomGradient from 'random-gradient';

export function useGradient(uid: any) {
  const gradient = useMemo(() => {
    return randomGradient(uid, 'linear');
  }, [uid]);
  return gradient;
}
