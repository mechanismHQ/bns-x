import React, { useMemo } from 'react';
import { getTxUrl } from '@common/utils';
import { ExternalLinkIcon } from './external-link';
import { useTxUrl } from '@common/hooks/use-tx-url';

export const ExternalTx: React.FC<{ txId?: string; btcTxId?: string }> = ({ txId = '' }) => {
  const url = useTxUrl(txId);
  if (typeof url === 'undefined') return null;
  return <ExternalLinkIcon href={url} />;
};
