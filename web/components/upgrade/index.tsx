import React from 'react';
import { Stack } from '@nelson-ui/react';
import { Text } from '../text';

import { currentUserV1NameState } from '../../common/store/names';
import { useAtomValue } from 'jotai';
import { Link } from '../link';
import { nameUpgradingAtom, wrapperDeployTxidAtom } from '@store/migration';
import { UpgradeOverview } from '@components/upgrade/overview';
import { UpgradeSteps } from '@components/upgrade/steps';

export const Upgrade: React.FC = () => {
  const deployTxid = useAtomValue(wrapperDeployTxidAtom);
  const v1Name = useAtomValue(currentUserV1NameState);
  const name = useAtomValue(nameUpgradingAtom);

  if (v1Name === null && !name) {
    return (
      <Stack>
        <Text variant="Heading03">You don&apos;t have a name!</Text>
        <Text variant="Body01">
          Head over to the <Link href="/faucet">faucet</Link> to get one.
        </Text>
      </Stack>
    );
  }

  if (deployTxid) {
    return <UpgradeSteps />;
  }

  return <UpgradeOverview />;
};
