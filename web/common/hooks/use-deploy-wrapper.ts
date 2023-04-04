import { useMigrationProgress } from '@common/hooks/use-migration-progress';
import { useOpenContractDeploy } from '@micro-stacks/react';
import { nameWrapperCodeState } from '@store/index';
import { networkAtom } from '@store/micro-stacks';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';

export function useDeployWrapper() {
  const { isRequestPending, openContractDeploy } = useOpenContractDeploy();

  const { saveWrapperTxid } = useMigrationProgress();

  const deploy = useAtomCallback(
    useCallback(
      async get => {
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
            await saveWrapperTxid(payload.txId);
          },
        });
      },
      [openContractDeploy, saveWrapperTxid]
    )
  );

  return {
    deploy,
    isRequestPending,
  };
}
