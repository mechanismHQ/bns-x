import { useEffect, useState } from 'react';

export function useIsSSR() {
  const [isSSR, setSSR] = useState(true);
  useEffect(() => {
    setSSR(false);
  }, [setSSR]);

  return isSSR;
}
