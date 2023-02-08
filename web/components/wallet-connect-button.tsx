import { useAuth } from '@micro-stacks/react';
import { Button } from '@components/button';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending } = useAuth();
  const label = isRequestPending ? 'Loading...' : 'Connect wallet';
  return (
    <Button
      onClick={async () => {
        await openAuthRequest();
      }}
    >
      {label}
    </Button>
  );
};
