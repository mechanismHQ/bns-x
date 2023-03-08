import { Button } from '@components/button';
import { useConnect } from '@common/hooks/use-connect';

export const WalletConnectButton = () => {
  const { openAuthRequest, isRequestPending } = useConnect();
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
