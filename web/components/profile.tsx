import React, { useMemo } from 'react';
import { Stack, Text, Box, Flex, Grid } from '@nelson-ui/react';
import { currentUserNameIdsState, userPrimaryNameState } from '@store/names';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { LoadableNameCard } from '@components/name-card';

export const Profile: React.FC<{ children?: React.ReactNode }> = () => {
  const primary = useAtomValue(userPrimaryNameState);
  const holdings = useAtomValue(currentUserNameIdsState[0]);

  useEffect(() => {
    console.log(holdings);
  }, [holdings]);

  const cards = useMemo(() => {
    return holdings.map(id => {
      return (
        <Box key={`name-${id}`}>
          <LoadableNameCard id={id} size="100%" />
        </Box>
      );
    });
  }, [holdings]);
  return (
    <Stack>
      <Text variant="Heading04">Your names</Text>
      <Grid
        gridTemplateColumns="1fr 1fr 1fr"
        gridColumnGap="$3"
        gridRowGap="$4"
        width="100%"
        alignItems="center"
      >
        {cards}
      </Grid>
    </Stack>
  );
};
