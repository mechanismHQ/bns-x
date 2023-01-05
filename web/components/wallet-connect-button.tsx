import { useAuth } from '@micro-stacks/react';
import { Link, LinkText } from './link';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending, signOut, isSignedIn } = useAuth();
  const label = isRequestPending ? 'Loading...' : isSignedIn ? 'Sign out' : 'Connect Stacks wallet';
  return (
    <LinkText
      onClick={async () => {
        if (isSignedIn) await signOut();
        else await openAuthRequest();
      }}
    >
      {label}
    </LinkText>
  );
};
