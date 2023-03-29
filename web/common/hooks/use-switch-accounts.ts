import { useCallback } from 'react';
import { useAuthState } from '@store/micro-stacks';

type OnFinish = () => Promise<void>;

export function useSwitchAccounts() {
  const { openAuthRequest } = useAuthState();

  const switchAccounts = useCallback(
    async (cb?: OnFinish) => {
      await openAuthRequest({
        async onFinish() {
          await cb?.();
        },
      });
    },
    [openAuthRequest]
  );

  return { switchAccounts };
}
