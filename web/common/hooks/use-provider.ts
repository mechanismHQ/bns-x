import { WebProvider } from '@clarigen/web';
import { useNetwork } from '@micro-stacks/react';

export function useProvider() {
  const { network } = useNetwork();
  return WebProvider({
    network,
  });
}
