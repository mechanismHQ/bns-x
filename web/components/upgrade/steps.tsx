import React from 'react';
import { CenterBox } from '@components/layout';
import { DeployPending } from '@components/upgrade/deploy-pending';
import { Text } from '../text';
import { Flex, Box } from '@nelson-ui/react';
import { FinalizeUpgrade } from '@components/upgrade/finalize';
import { UpgradeDone } from '@components/upgrade/done';

export const UpgradeSteps: React.FC = () => {
  return (
    <Box flexGrow={1}>
      <Flex justifyContent={'center'} height="100%" flexDirection="column" alignItems={'center'}>
        <Box flexGrow={1} />
        <Flex width="100%" alignItems={'center'} flexDirection="column">
          <DeployPending />
          <FinalizeUpgrade />
          <UpgradeDone />
        </Flex>
        <Box flexGrow={1} />
      </Flex>
    </Box>
  );
};
