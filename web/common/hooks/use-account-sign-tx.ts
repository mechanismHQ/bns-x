import { getNetwork } from '@common/constants';
import type {
  ContractCallParams,
  ContractDeployParams,
  SignTransactionRequest,
  StxTransferParams,
} from '@micro-stacks/client';
import { Status, StatusKeys, TxType } from '@micro-stacks/client';
import { useStatuses } from '@micro-stacks/react';
import { appDetailsAtom, currentAccountAtom } from '@store/micro-stacks';
import type { Account } from '@store/micro-stacks';
import { clientState } from '@store/micro-stacks';
import { useAtomValue } from 'jotai';
import { useAtomCallback } from 'jotai/utils';
import type { FinishedTxData } from 'micro-stacks/connect';
import { makeContractDeployToken, makeStxTransferToken } from 'micro-stacks/connect';
import { openTransactionPopup } from 'micro-stacks/connect';
import { makeContractCallToken } from 'micro-stacks/connect';
import { useCallback, useMemo } from 'react';

export type TxRequest =
  | {
      type: TxType.ContractCall;
      params: ContractCallParams;
    }
  | {
      type: TxType.ContractDeploy;
      params: ContractDeployParams;
    }
  | {
      type: TxType.TokenTransfer;
      params: StxTransferParams;
    };

export function useAccountSignTx(_account?: Account) {
  const currentAccount = useAtomValue(currentAccountAtom);
  const account = _account ?? currentAccount;
  const status = useStatuses();

  const openSignTransaction = useAtomCallback(
    useCallback(
      async (get, set, txRequest: TxRequest) => {
        const client = get(clientState);
        const appDetails = get(appDetailsAtom);
        const network = getNetwork();
        const { params, type } = txRequest;

        if (!account?.appPrivateKey) {
          throw new Error('Account is undefined');
        }
        if (typeof appDetails === 'undefined') {
          throw new Error('App details are undefined');
        }

        const sharedParams = {
          privateKey: account.appPrivateKey,
          appDetails,
          stxAddress: account.stxAddress,
          network,
          postConditionMode: params.postConditionMode,
          postConditions: params.postConditions,
          attachment: params.attachment,
          sponsored: params.sponsored,
        };

        const fn =
          type === TxType.TokenTransfer
            ? makeStxTransferToken
            : type === TxType.ContractCall
            ? makeContractCallToken
            : makeContractDeployToken;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const token = await fn({
          ...sharedParams,
          ...params,
        } as any);

        client.setIsRequestPending(StatusKeys.TransactionSigning);

        let result: FinishedTxData | undefined;

        await openTransactionPopup({
          token,
          onFinish: payload => {
            result = payload;
            params?.onFinish?.(payload);
            client.setIsIdle(StatusKeys.TransactionSigning);
          },
          onCancel: error => {
            params?.onCancel?.(error);
            client.setIsIdle(StatusKeys.TransactionSigning);
          },
        });

        return result;
      },
      [account?.appPrivateKey, account?.stxAddress]
    )
  );

  const isRequestPending = useMemo(
    () => status[StatusKeys.TransactionSigning] === Status.IsLoading,
    [status]
  );

  return {
    openSignTransaction,
    isRequestPending,
    account,
  };
}
