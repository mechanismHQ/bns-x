import type {
  ContractCallTransaction,
  MempoolContractCallTransaction,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import type { ArgsRecord, ExtractArgsRecord, TypedAbiFunction, TypedAbiArg } from '@clarigen/core';
import { ArgsTuple, cvToValue, ExtractArgs, toCamelCase } from '@clarigen/core';
import { fetchJson, generateUrl, txEndpoint } from 'micro-stacks/api';
import { hexToCV } from 'micro-stacks/clarity';
import { fetchPrivate } from 'micro-stacks/common';

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
  const _txid = txid.startsWith('0x') ? txid : `0x${txid}`;
  const path = generateUrl(`${txEndpoint(url)}/${_txid}`, {
    event_offset,
    event_limit,
    unanchored,
  });
  const res = await fetchPrivate(path);
  if (!res.ok) {
    throw new Error('Unable to fetch transaction');
  }
  return (await res.json()) as Transaction | MempoolTransaction;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = cvToValue(hexToCV(resultHex), true);
    const success = status === 'success';
    return {
      args,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
