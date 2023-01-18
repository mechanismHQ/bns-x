import { useAuth } from '@micro-stacks/react';
import { Link, LinkText } from './link';
import { Button } from '@components/button';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const label = isRequestPending ? 'Loading...' : 'Connect wallet';
  return (
    <Button
      onClick={async () => {
        console.log('signing in');
        await openAuthRequest();
      }}
    >
      {label}
    </Button>
  );
};
