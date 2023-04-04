import React, { useCallback, useMemo } from 'react';
import { Flex, Box, Stack } from '@nelson-ui/react';
import { Text } from '@components/text';
import { ProfileRow } from '@components/profile';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { ProgressBar } from '@components/progress-bar';
import { DropdownMenu, PopoverOption } from '@components/dropdown-menu';
import { BoxLink } from '@components/link';

const rowCount = 5;

const ProgressMoving = () => {
  const [progress, setProgress] = React.useState({ value: 45, pending: true });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(cur => {
        if (cur.pending) {
          return { value: 50, pending: false };
        }
        return { value: 45, pending: true };
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return <ProgressBar {...progress} />;
};

export const Ui: React.FC<{ children?: React.ReactNode }> = () => {
  const profileRows = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return [...new Array(rowCount)].map((_, _i) => {
      const name = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '-',
      });
      return <ProfileRow key={name} name={name} />;
    });
  }, []);
  return (
    <Stack spacing="20px">
      <Flex>
        <DropdownMenu
          popover={
            <>
              <BoxLink href="/">
                <PopoverOption>First</PopoverOption>
              </BoxLink>
            </>
          }
        >
          Actions
        </DropdownMenu>
      </Flex>
      <Flex width="100%" justifyContent={'center'}>
        <Stack spacing="10px" width="100%" maxWidth="500px">
          <Text variant="Heading035">Progress bars</Text>
          <ProgressBar value={3} pending={false} />
          <ProgressBar value={50} pending={false} />
          <ProgressBar value={100} pending={false} />
          <ProgressBar value={50} pending={true} />
          <ProgressBar value={95} pending={true} />
          <ProgressMoving />
        </Stack>
      </Flex>
      <Stack spacing="0" width="100%">
        {profileRows}
      </Stack>
    </Stack>
  );
};
