import React from 'react';
import { CenterBox } from '@components/layout';
import { DeployPending } from '@components/upgrade/deploy-pending';
import { Text } from '../text';
import { Flex, Box } from '@nelson-ui/react';
import { FinalizeUpgrade } from '@components/upgrade/finalize';
import { UpgradeDone } from '@components/upgrade/done';

export const UpgradeSteps: React.FC = () => {
  return (
    <>
      <DeployPending />
      <FinalizeUpgrade />
      <UpgradeDone />
    </>
  );
};
