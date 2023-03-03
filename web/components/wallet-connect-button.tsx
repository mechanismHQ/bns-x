import { useAppDetails, useAuth } from '@micro-stacks/react';
import { Button } from '@components/button';
import { defineCustomElements } from '@stacks/connect-ui/loader';
import { useCallback } from 'react';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending } = useAuth();
  const appDetails = useAppDetails();
  const label = isRequestPending ? 'Loading...' : 'Connect wallet';

  const showConnect = useCallback(async () => {
    if ('StacksProvider' in window) {
      await openAuthRequest();
    } else {
      await defineCustomElements(window);
      const element = document.createElement('connect-modal');
      element.authOptions = {
        appDetails: {
          name: appDetails.appName,
          icon: appDetails.appIconUrl,
        },
      };
      document.body.appendChild(element);
      const handleEsc = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') {
          document.removeEventListener('keydown', handleEsc);
          element.remove();
        }
      };
      document.addEventListener('keydown', handleEsc);
    }
  }, []);
  return (
    <Button
      onClick={async () => {
        await showConnect();
        // await openAuthRequest();
      }}
    >
      {label}
    </Button>
  );
};
