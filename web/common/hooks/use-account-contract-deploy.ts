import { useAccountSignTx } from '@common/hooks/use-account-sign-tx';
import type { ContractDeployParams } from '@micro-stacks/client';
import { TxType } from '@micro-stacks/client';
import type { Account } from '@store/micro-stacks';
import type { FinishedTxData } from 'micro-stacks/connect';
import { useCallback } from 'react';

interface UseOpenContractDeploy {
  openContractDeploy: (params: ContractDeployParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
  account?: Account;
}

export function useAccountOpenContractDeploy(_account?: Account): UseOpenContractDeploy {
  const { isRequestPending, openSignTransaction, account } = useAccountSignTx(_account);

  const openContractDeploy = useCallback(
    (params: ContractDeployParams) => {
      return openSignTransaction({
        type: TxType.ContractDeploy,
        params,
      });
    },
    [openSignTransaction]
  );

  return {
    isRequestPending,
    openContractDeploy,
    account,
  };
}
