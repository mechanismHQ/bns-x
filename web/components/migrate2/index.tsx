import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack, Grid } from '@nelson-ui/react';
import { Text } from '../text';
import { Button } from '../button';

import { currentUserV1NameState } from '../../common/store/names';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import { Link } from '../link';
// import { MigrateFinalizeStep } from './finalize';
import { DeployStep } from '@components/migrate/deploy';
import { contractsState, txReceiptState, useReadOnly } from '@store/index';
import {
  migrateNameAtom,
  migrateTxidAtom,
  wrapperContractIdAtom,
  wrapperSignatureAtom,
} from '@store/migration';
import { MigrateDone } from '@components/migrate/done';
import { NameCard } from '@components/name-card';
import { useEffect } from 'react';

export const Migrate: React.FC = () => {
  return (
    <Grid gridTemplateColumns="1fr 1fr" gridColumnGap="60px">
      <Box width="100%">
        <Box
          width="100%"
          borderRadius="18px"
          border="1px solid $surface-error-border-subdued"
          backgroundColor="$color-surface-error"
          color="$color-alert-red"
        >
          <SpaceBetween height="90px" alignItems="center" px="32px" isInline>
            <Text variant="Body01" color="$color-alert-red">
              panic.disco.btc
            </Text>
            <Box padding="3px 10px" borderRadius="5px" backgroundColor="#301211">
              <Text variant="Label01" color="$color-alert-red">
                BNS
              </Text>
            </Box>
          </SpaceBetween>
          <Stack
            px="32px"
            spacing="10px"
            py="26px"
            borderTop="1px solid $surface-error-border-subdued"
          >
            <Text variant="Heading06" color="$color-alert-red">
              On BNS legacy
            </Text>
            <Stack spacing="1px">
              <Text variant="Body01" color="$color-alert-red">
                • One name per address
              </Text>
              <Text variant="Body01" color="$color-alert-red">
                • No NFT compatibility
              </Text>
              <Text variant="Body01" color="$color-alert-red">
                • No dev team
              </Text>
              <Text variant="Body01" color="$color-alert-red">
                • Sadness forever
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <Stack spacing="25px">
        <Box width="100%" borderRadius="18px" border="1px solid $onSurface-border-subdued">
          <SpaceBetween height="90px" alignItems="center" px="32px" isInline>
            <Text variant="Body01">panic.disco.btc</Text>
            <Box padding="3px 10px" borderRadius="5px" backgroundColor="$grey-800">
              <Text variant="Label01">BNS</Text>
            </Box>
          </SpaceBetween>
          <Stack px="32px" spacing="10px" py="26px" borderTop="1px solid $onSurface-border-subdued">
            <Text variant="Heading06">On BNSx</Text>
            <Stack spacing="1px" pb="18px">
              <Text variant="Body01">• Many names per address</Text>
              <Text variant="Body01">• NFT compatibility in apps & wallets</Text>
              <Text variant="Body01">• Dedicated dev team</Text>
              <Text variant="Body01">• New features every week</Text>
            </Stack>
            <Box>
              <Button>Upgrade to BNSx</Button>
            </Box>
          </Stack>
        </Box>
        <Text
          variant="Caption01"
          color="$onSurface-text-dim"
          fontWeight="300"
          fontSize="14px"
          letterSpacing={'-1%'}
        >
          Please be careful: BNSx is advanced, experimental, and unaudited software. Bugs could
          result in complete loss of tokens.
        </Text>
        <Text
          variant="Caption01"
          color="$onSurface-text-dim"
          fontWeight="300"
          fontSize="14px"
          letterSpacing={'-1%'}
        >
          Learn more about BNSx
        </Text>
      </Stack>
    </Grid>
  );
};
