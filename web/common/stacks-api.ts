import {
  ContractCallTransaction,
  MempoolContractCallTransaction,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import { contracts, TypedAbiArg, TypedAbiFunction } from './clarigen';
import {
  ArgsRecord,
  ArgsTuple,
  cvToValue,
  ExtractArgs,
  ExtractArgsRecord,
  toCamelCase,
} from '@clarigen/core';
import { fetchJson, generateUrl, txEndpoint } from 'micro-stacks/api';
import { hexToCV } from 'micro-stacks/clarity';

export type ResponseType<T> = T extends TypedAbiFunction<TypedAbiArg<unknown, string>[], infer R>
  ? R
  : never;

export type ExtractTx<F> = F extends TypedAbiFunction<infer Args, infer R>
  ?
      | {
          args: ArgsRecord<Args>;
          result: R;
          transaction: ContractCallTransaction;
          finished: true;
          success: boolean;
        }
      | {
          args: ArgsRecord<Args>;
          result: undefined;
          transaction: MempoolContractCallTransaction;
          finished: false;
          success: undefined;
        }
  : never;

type FetchTxArgs = Parameters<typeof fetchTransaction>[0];

export async function fetchTransaction({
  txid,
  event_offset,
  event_limit,
  url,
  unanchored,
}: {
  txid: string;
  url: string;
  event_offset?: number;
  event_limit?: number;
  unanchored?: boolean;
}): Promise<MempoolTransaction | Transaction> {
  const path = generateUrl(`${txEndpoint(url)}/${txid}`, {
    event_offset,
    event_limit,
    unanchored,
  });
  return fetchJson<Transaction | MempoolTransaction>(path);
}

export async function fetchTypedTransaction<F>(options: FetchTxArgs): Promise<ExtractTx<F>> {
  const transaction = await fetchTransaction(options);
  return convertTypedTx<F>(transaction);
}

export function convertTypedTx<F>(transaction: Transaction | MempoolTransaction): ExtractTx<F> {
  if (transaction.tx_type !== 'contract_call') {
    throw new Error('Cannot extract tx - not a contract call.');
  }
  const args = Object.fromEntries(
    (transaction.contract_call.function_args || []).map(arg => {
      const cv = hexToCV(arg.hex);
      return [toCamelCase(arg.name), cvToValue(cv, true)];
    })
  ) as ExtractArgsRecord<F>;
  const status = transaction.tx_status;
  if (
    status === 'success' ||
    status === 'abort_by_response' ||
    status === 'abort_by_post_condition'
  ) {
    const resultHex = transaction.tx_result.hex;
    const result = cvToValue(hexToCV(resultHex), true) as ResponseType<F>;
    const success = status === 'success';
    return {
      args,
      result,
      finished: true,
      transaction: transaction,
      success,
    } as unknown as ExtractTx<F>;
  }

  return {
    args,
    finished: false,
    transaction,
  } as unknown as ExtractTx<F>;
}
