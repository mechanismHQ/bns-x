import { Url } from '@components/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { UrlObject } from 'url';

export function useAccountPath(path: string, query?: Record<string, string>) {
  const router = useRouter();

  const finalPath = useMemo(() => {
    const q = query ?? {};
    const address = router.query.address;
    if (typeof address === 'string')
      return {
        pathname: `/accounts/[address]${path}`,
        query: {
          address,
          ...q,
        },
      };

    return {
      pathname: path,
      query: q,
    };
  }, [router.query.address, path, query]);

  return finalPath;
}
