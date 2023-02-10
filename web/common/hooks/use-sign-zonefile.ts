import { useCallback } from 'react';
import {
  combinedZonefileState,
  signedInscriptionZonefileAtom,
  userZonefileState,
} from '@store/names';
import { useAtomValue } from 'jotai';
import { useOpenSignMessage } from '@micro-stacks/react';
import { useAtomCallback } from 'jotai/utils';

export function useSignZonefile() {
  const { isRequestPending, openSignMessage } = useOpenSignMessage();

  const signMessage = useAtomCallback(
    useCallback(
      async (get, set) => {
        const zonefile = get(combinedZonefileState);
        if (zonefile === null) return;
        console.log('zonefile', zonefile);
        const sig = await openSignMessage({ message: zonefile });
        if (typeof sig !== 'undefined') {
          set(signedInscriptionZonefileAtom, sig);
        }
      },
      [openSignMessage]
    )
  );

  return {
    signMessage,
    isRequestPending,
  };
}
