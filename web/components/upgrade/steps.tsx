import React from 'react';
import { CenterBox } from '@components/layout';
import { DeployPending } from '@components/upgrade/deploy-pending';
import { Text } from '../text';
import { Flex, Box } from '@nelson-ui/react';
import { FinalizeUpgrade } from '@components/upgrade/finalize';
import { UpgradeDone } from '@components/upgrade/done';
import { useAtomValue } from 'jotai';
import { stxAddressAtom } from '@store/micro-stacks';
import { useMonitorProgress } from '@common/hooks/use-monitor-progress';

export const UpgradeSteps: React.FC = () => {
  const stxAddress = useAtomValue(stxAddressAtom);
  useMonitorProgress(stxAddress!);
  return (
    <>
      <DeployPending />
      <FinalizeUpgrade />
      <UpgradeDone />
    </>
  );
};
