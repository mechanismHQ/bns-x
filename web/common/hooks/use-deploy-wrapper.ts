import { useMigrationProgress } from '@common/hooks/use-migration-progress';
import { useOpenContractDeploy } from '@micro-stacks/react';
import { nameWrapperCodeState } from '@store/index';
import { networkAtom } from '@store/micro-stacks';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import {
  nameUpgradingAtom,
  wrapperDeployTxidAtom,
  wrapperDeployTxidHashAtom,
} from '@store/migration';

export function useDeployWrapper() {
  const { isRequestPending, openContractDeploy } = useOpenContractDeploy();

  const { saveProgress } = useMigrationProgress();

  const deploy = useAtomCallback(
    useCallback(
      async get => {
        const name = get(nameUpgradingAtom);
        const network = get(networkAtom);
        const wrapperCode = get(nameWrapperCodeState);
        const nonce = new Date().getTime() % 2000;
        await openContractDeploy({
          contractName: `name-wrapper-${nonce}`,
          codeBody: wrapperCode,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          network: {
            ...network,
            coreApiUrl: network.getCoreApiUrl(),
          },
          async onFinish(payload) {
            // set(wrapperDeployTxidHashAtom, payload.txId);
            await saveProgress({
              wrapperTxid: payload.txId,
              name: name!,
            });
          },
        });
      },
      [openContractDeploy, saveProgress]
    )
  );

  return {
    deploy,
    isRequestPending,
  };
}
