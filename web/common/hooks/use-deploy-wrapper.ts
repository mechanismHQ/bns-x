import { useOpenContractDeploy } from '@micro-stacks/react';
import { useAtom } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { wrapperDeployTxidAtom } from '../store/migration';
import { nameWrapperCode } from '../wrapper-code';

export function useDeployWrapper() {
  const { isRequestPending, openContractDeploy } = useOpenContractDeploy();

  const deploy = useAtomCallback(
    useCallback(
      async (get, set) => {
        const nonce = new Date().getTime() % 2000;
        await openContractDeploy({
          contractName: `name-wrapper-${nonce}`,
          codeBody: nameWrapperCode,
          onFinish(payload) {
            set(wrapperDeployTxidAtom, payload.txId);
          },
        });
      },
      [openContractDeploy]
    )
  );

  return {
    deploy,
    isRequestPending,
  };
}
