import { useCallback } from 'react';
import { useAuthState } from '@store/micro-stacks';
import { useRouter } from 'next/router';

export function useSwitchAccounts() {
  const { openAuthRequest } = useAuthState();
  const router = useRouter();

  const switchAccounts = useCallback(async () => {
    await openAuthRequest({
      async onFinish() {
        await router.push({
          pathname: '/profile',
        });
      },
    });
  }, [openAuthRequest, router]);

  return { switchAccounts };
}
