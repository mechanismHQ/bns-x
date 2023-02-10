import { useCallback } from 'react';
import { useAuthState } from '@store/micro-stacks';
import { useRouter } from 'next/router';
import { ONLY_INSCRIPTIONS } from '@common/constants';

export function useSwitchAccounts() {
  const { openAuthRequest } = useAuthState();
  const router = useRouter();

  const switchAccounts = useCallback(async () => {
    await openAuthRequest({
      async onFinish() {
        const pathname = ONLY_INSCRIPTIONS ? '/' : '/profile';
        await router.push({
          pathname,
        });
      },
    });
  }, [openAuthRequest, router]);

  return { switchAccounts };
}
