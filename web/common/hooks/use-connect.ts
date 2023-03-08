import { useCallback } from 'react';
import { defineCustomElements } from '@stacks/connect-ui/loader';
import { useAuthState, useAppDetails } from '@store/micro-stacks';
import type { MicroStacksClient } from '@micro-stacks/client';

type AuthParams = Parameters<MicroStacksClient['authenticate']>[0];

export function useConnect() {
  const { openAuthRequest: _openAuthRequest, isRequestPending, isSignedIn } = useAuthState();
  const appDetails = useAppDetails();

  const showConnect = useCallback(
    async (params?: AuthParams) => {
      if ('StacksProvider' in window) {
        await _openAuthRequest(params);
      } else {
        await defineCustomElements(window);
        const element = document.createElement('connect-modal');
        if (appDetails) {
          element.authOptions = {
            appDetails,
          };
        }
        document.body.appendChild(element);
        const handleEsc = (ev: KeyboardEvent) => {
          if (ev.key === 'Escape') {
            document.removeEventListener('keydown', handleEsc);
            element.remove();
          }
        };
        document.addEventListener('keydown', handleEsc);
      }
    },
    [appDetails, _openAuthRequest]
  );

  return {
    openAuthRequest: showConnect,
    isRequestPending,
    isSignedIn,
  };
}
