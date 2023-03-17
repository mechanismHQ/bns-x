import { nameToTupleBytes } from '@common/utils';
import { useOpenContractCall } from '@micro-stacks/react';
import { bnsContractState } from '@store/index';
import { userNameState, ZONEFILE_TEMPLATE } from '@store/names';
import { editedZonefileState, nameUpdateTxidAtom, profileFormValidAtom } from '@store/profile';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { makeZoneFile } from '@fungible-systems/zone-file';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashRipemd160 } from 'micro-stacks/crypto';
import { networkAtom } from '@store/micro-stacks';
import { PostConditionMode } from 'micro-stacks/transactions';

export function useNameUpdate() {
  const { openContractCall, isRequestPending } = useOpenContractCall();

  const updateName = useAtomCallback(
    useCallback(
      async (get, set) => {
        const name = get(userNameState);
        const bns = get(bnsContractState);
        const zonefile = get(editedZonefileState);
        const network = get(networkAtom);
        const formState = get(profileFormValidAtom);
        if (name === null) {
          throw new Error('Invalid state: no name');
        }

        if (!formState.canSubmit) return;

        const nameBytes = nameToTupleBytes(name);
        const zonefileString = makeZoneFile(zonefile, ZONEFILE_TEMPLATE);
        console.log(zonefileString);
        const zonefileBytes = utf8ToBytes(zonefileString);
        const zonefileHash = hashRipemd160(hashSha256(zonefileBytes));
        console.log(bytesToHex(zonefileHash));

        const tx = bns.nameUpdate({
          ...nameBytes,
          zonefileHash,
        });

        await openContractCall({
          ...tx,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          network: {
            ...network,
            coreApiUrl: network.getCoreApiUrl(),
          },
          postConditionMode: PostConditionMode.Deny,
          attachment: zonefileString,
          // postConditions: [postCondition],
          onFinish(payload) {
            set(nameUpdateTxidAtom, payload.txId);
            // set(migrateTxidAtom, payload.txId);
          },
        });
      },
      [openContractCall]
    )
  );

  return {
    updateName,
    isRequestPending,
  };
}
