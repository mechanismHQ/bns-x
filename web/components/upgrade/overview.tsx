import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack, Grid } from '@nelson-ui/react';
import { Text } from '../text';
import { Button } from '../button';
import { styled } from '@common/theme';

import { currentUserV1NameState } from '../../common/store/names';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import { useEffect } from 'react';
import { useDeployWrapper } from '@common/hooks/use-deploy-wrapper';
import { nameUpgradingAtom } from '@store/migration';
import { Link, LinkText } from '@components/link';
// import { styled } from '@stitches/react';

export const RespGrid = styled(Grid, {
  gridTemplateColumns: '1fr 1fr',
  gridColumnGap: '60px',
  '@sm': {
    gridTemplateColumns: '1fr',
    gridRowGap: '32px',
  },
});

export const UpgradeOverview: React.FC = () => {
  const { deploy, isRequestPending: deployPending } = useDeployWrapper();
  const v1Name = useAtomValue(nameUpgradingAtom);
  if (!v1Name) throw new Error('Invalid state');

  return (
    <>
      <Box flexGrow={1} />
      <Stack spacing="42px" px="29px">
        <Text variant="Display02">Upgrade to BNSx</Text>
        <RespGrid>
          <Box width="100%">
            <Box
              width="100%"
              borderRadius="18px"
              border="1px solid $onSurface-border-subdued"
              // backgroundColor="$dark-warning-surface-warning"
              // color="$warning-surface-warning"
            >
              <SpaceBetween height="90px" alignItems="center" px="32px" isInline>
                <Text variant="Body01" color="$icon-subdued">
                  {v1Name}
                </Text>
                <Box padding="3px 10px" borderRadius="5px" backgroundColor="$grey-800">
                  <Text variant="Label01" color="$warning-surface-warning">
                    BNS Core
                  </Text>
                </Box>
              </SpaceBetween>
              <Stack
                px="32px"
                spacing="10px"
                py="26px"
                borderTop="1px solid $onSurface-border-subdued"
              >
                <Text variant="Heading06" color="$icon-subdued">
                  On BNS Core
                </Text>
                <Stack spacing="1px">
                  <Text variant="Body01" color="$icon-subdued">
                    ❌ One name per address
                  </Text>
                  <Text variant="Body01" color="$icon-subdued">
                    ❌ No NFT compatibility
                  </Text>
                  <Text variant="Body01" color="$icon-subdued">
                    ✅ Ability to update your zonefile
                  </Text>
                  {/* <Text variant="Body01" color="$icon-subdued">
                    • No dev team
                  </Text> */}
                  {/* <Text variant="Body01" color="$icon-subdued">
                    • Sadness forever
                  </Text> */}
                </Stack>
              </Stack>
            </Box>
          </Box>
          <Stack spacing="25px">
            <Box width="100%" borderRadius="18px" border="1px solid $onSurface-border-subdued">
              <SpaceBetween height="90px" alignItems="center" px="32px" isInline>
                <Text variant="Body01">{v1Name}</Text>
                <Box padding="3px 10px" borderRadius="5px" backgroundColor="$grey-800">
                  <Text variant="Label01">BNSx</Text>
                </Box>
              </SpaceBetween>
              <Stack
                px="32px"
                spacing="10px"
                py="26px"
                borderTop="1px solid $onSurface-border-subdued"
              >
                <Text variant="Heading06">On BNSx</Text>
                <Stack spacing="1px" pb="18px">
                  <Text variant="Body01">✅ Many names per address</Text>
                  <Text variant="Body01">✅ NFT compatibility in apps & wallets</Text>
                  <Text variant="Body01">✅ Always convertable back to BNS Core</Text>
                  <Text variant="Body01">❌ Can&apos;t update your zonefile</Text>
                  {/* <Text variant="Body01">• Dedicated dev team</Text> */}
                  {/* <Text variant="Body01">• New features every week</Text> */}
                </Stack>
                <Box>
                  <Button onClick={deploy}>
                    {deployPending ? 'Waiting for tx..' : 'Upgrade to BNSx'}
                  </Button>
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
            <Link
              plain
              href="https://docs.bns.xyz"
              variant="Caption01"
              color="$onSurface-text-dim"
              fontWeight="300"
              fontSize="14px"
              letterSpacing={'-1%'}
            >
              Learn more about BNSx
            </Link>
          </Stack>
        </RespGrid>
      </Stack>
      <Box flexGrow={2} />
    </>
  );
};
