import React, { useMemo } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { allNostrNamesState, trpc } from '@store/api';
import { useAtomValue } from 'jotai';
import { ExternalLinkIcon } from '@components/icons/external-link';
import { Link } from '@components/link';

export const Nostr: React.FC = () => {
  const nostrNames = useAtomValue(allNostrNamesState);

  const rows = useMemo(() => {
    return nostrNames.map(name => {
      return (
        <Stack key={name.name} spacing="3px">
          <Stack isInline alignItems={'center'}>
            <Text variant="Heading035">{name.name}</Text>
            <ExternalLinkIcon
              cursor="pointer"
              onClick={() => {
                window.open(`https://nostr.directory/p/${name.nostr}`, '_blank');
              }}
            />
          </Stack>
          <Text variant="Body01" lineHeight={0}>
            <pre>{name.nostr}</pre>
          </Text>
        </Stack>
      );
    });
  }, [nostrNames]);

  return (
    <Stack spacing="20px" px="29px">
      <Text variant="Heading02">Nostr on BNS</Text>
      <Text variant="Body01" maxWidth="600px">
        A directory of BNS users who have linked their Nostr public keys to their BNS names.
        Interested in joining the list? Use{' '}
        <Link href="https://btc.us" target="_blank">
          btc.us
        </Link>{' '}
        to update your Zonefile.
      </Text>
      {rows}
    </Stack>
  );
};
