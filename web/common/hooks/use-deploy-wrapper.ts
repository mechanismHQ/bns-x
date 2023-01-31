import { makeNameWrapper } from '@common/wrapper';
import { useOpenContractDeploy } from '@micro-stacks/react';
import { networkAtom } from '@store/micro-stacks';
import { useAtomCallback } from 'jotai/utils';
import { useCallback } from 'react';
import { wrapperDeployTxidAtom } from '../store/migration';

export function useDeployWrapper() {
  const { isRequestPending, openContractDeploy } = useOpenContractDeploy();

  const deploy = useAtomCallback(
    useCallback(
      async (get, set) => {
        const network = get(networkAtom);
        const wrapperCode = makeNameWrapper();
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
