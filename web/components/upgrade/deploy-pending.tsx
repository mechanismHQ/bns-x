import React from 'react';
import { useAtomValue } from 'jotai';
import { wrapperDeployTxidAtom, wrapperSignatureState } from '@store/migration';
import { NameHeading, PendingRow, UpgradeBox } from '@components/upgrade/rows';

export const DeployPending: React.FC<{ children?: React.ReactNode }> = () => {
  const signature = useAtomValue(wrapperSignatureState);

  if (signature) return null;

  return (
    <UpgradeBox>
      <PendingRow txidAtom={wrapperDeployTxidAtom}>Waiting for confirmations</PendingRow>
    </UpgradeBox>
  );
};
