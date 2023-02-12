import React, { useMemo } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { allNostrNamesState, trpc } from '@store/api';
import { useAtomValue } from 'jotai';
import { ExternalLinkIcon } from '@components/icons/external-link';

export const Nostr: React.FC = () => {
  const nostrNames = useAtomValue(allNostrNamesState);

  const rows = useMemo(() => {
    return nostrNames.map(name => {
      return (
        <Stack key={name.name} spacing="3px" px="29px">
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

  return <Stack spacing="15px">{rows}</Stack>;
};
