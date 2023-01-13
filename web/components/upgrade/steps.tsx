import React from 'react';
import { CenterBox } from '@components/layout';
import { DeployPending } from '@components/upgrade/deploy-pending';
import { Text } from '../text';
import { Flex, Box } from '@nelson-ui/react';
import { FinalizeUpgrade } from '@components/upgrade/finalize';

export const UpgradeSteps: React.FC = () => {
  return (
    <Box flexGrow={1}>
      <Flex justifyContent={'center'} height="100%" flexDirection="column" alignItems={'center'}>
        <Box flexGrow={1} />
        <CenterBox flexGrow={'initial'}>
          <DeployPending />
          <FinalizeUpgrade />
        </CenterBox>
        <Box flexGrow={1} />
      </Flex>
    </Box>
  );
};
