import { useAccountSignTx } from '@common/hooks/use-account-sign-tx';
import type { ContractCallParams } from '@micro-stacks/client';
import { TxType } from '@micro-stacks/client';
import type { Account } from '@store/micro-stacks';
import type { FinishedTxData } from 'micro-stacks/connect';
import { useCallback } from 'react';

interface UseOpenContractCall {
  openContractCall: (params: ContractCallParams) => Promise<FinishedTxData | undefined>;
  isRequestPending: boolean;
  account?: Account;
}

export function useAccountOpenContractCall(_account?: Account): UseOpenContractCall {
  const { isRequestPending, openSignTransaction, account } = useAccountSignTx(_account);

  const openContractCall = useCallback(
    (params: ContractCallParams) => {
      return openSignTransaction({
        type: TxType.ContractCall,
        params,
      });
    },
    [openSignTransaction]
  );

  return {
    account,
    isRequestPending,
    openContractCall,
  };
}
