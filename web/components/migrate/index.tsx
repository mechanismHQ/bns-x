import React, { useCallback } from 'react';
import { Box, Flex, SpaceBetween, Stack } from '@nelson-ui/react';
import { Text } from '../text';

import { currentUserV1NameState } from '../../common/store/names';
import { useAtomCallback, useAtomValue } from 'jotai/utils';
import { Link } from '../link';
import { MigrateFinalizeStep } from './finalize';
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
  const v1Name = useAtomValue(currentUserV1NameState);
  const migrateTxid = useAtomValue(migrateTxidAtom);
  const name = useAtomValue(migrateNameAtom);

  const cacheName = useAtomCallback(
    useCallback((get, set, name: string) => {
      set(migrateNameAtom, name);
    }, [])
  );

  useEffect(() => {
    if (v1Name?.combined) {
      cacheName(v1Name?.combined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v1Name?.combined]);

  if (v1Name === null && !migrateTxid) {
    return (
      <Stack>
        <Text variant="Heading03">You don&apos;t have a name!</Text>
        <Text variant="Body01">
          Head over to the <Link href="/faucet">faucet</Link> to get one.
        </Text>
      </Stack>
    );
  }

  return (
    <SpaceBetween isInline alignItems={'start'}>
      <Stack height="100%">
        <Text variant="Heading03">Mint your BNS X name</Text>
        {v1Name ? (
          <Text variant="Body02" maxWidth="400px">
            Hello,{' '}
            <Text display="inline" fontWeight="600" fontFamily="Courier New">
              {name}
            </Text>
          </Text>
        ) : (
          <Text variant="Body02">You&apos;re all done!</Text>
        )}
        <DeployStep />
        <MigrateFinalizeStep />
        <MigrateDone />
      </Stack>
      {name ? <NameCard name={name} /> : null}
    </SpaceBetween>
  );
};
