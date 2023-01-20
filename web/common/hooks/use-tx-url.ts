import { getTxId, getTxUrl } from '@common/utils';
import { networkAtom } from '@store/micro-stacks';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export function useTxUrl(txid: string) {
  const network = useAtomValue(networkAtom);

  return useMemo(() => {
    return getTxUrl(txid, network);
  }, [network, txid]);
}
