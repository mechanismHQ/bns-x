import { Url } from '@components/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { UrlObject } from 'url';

export function useAccountPath(path: string, objectAlways = false) {
  const router = useRouter();

  const finalPath = useMemo(() => {
    const address = router.query.address;
    if (typeof address === 'string')
      return {
        pathname: `/accounts/[address]${path}`,
        query: { address },
      };

    if (objectAlways) {
      return {
        pathname: path,
      };
    } else {
      return path;
    }
  }, [router.query.address, path, objectAlways]);

  return finalPath;
}
