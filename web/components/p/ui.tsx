import React, { useMemo } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { ProfileRow } from '@components/profile';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const rowCount = 5;

export const Ui: React.FC<{ children?: React.ReactNode }> = () => {
  const profileRows = useMemo(() => {
    return [...new Array(rowCount)].map((_, i) => {
      const name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
      });
      return <ProfileRow name={name} />;
    });
  }, []);
  return (
    <Stack spacing="0" width="100%">
      {profileRows}
    </Stack>
  );
};
