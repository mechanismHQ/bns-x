import React from 'react';
import { Flex, Box, Text, SpaceBetween } from '@nelson-ui/react';
import { nameByIdState } from '@store/names';
import { useAtomValue } from 'jotai';
import { keyframes } from '@nelson-ui/core';

const magicBg = keyframes({
  '0%': { backgroundPosition: '10% 0%' },
  '50%': { backgroundPosition: '91% 100%' },
  '100%': { backgroundPosition: '10% 0%' },
});

export const NameCard: React.FC<{ children?: React.ReactNode; name: string; size?: string }> = ({
  name,
  size = '400px',
}) => {
  return (
    <Box
      width={size}
      aspectRatio={1}
      // height={size}
      backgroundImage="linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
      backgroundColor="gray"
      // background="linear-gradient(134deg, #f8a4e5 0%, #5e7fff 27.86%, #56f9f4 47.39%, #38fbfc 47.4%, #ffefc5 57.03%, #f8a4e5 79.43%, #38fbfc 100%)"
      p="$5"
      position={'relative'}
      borderRadius="$medium"
      maxWidth="100%"
      backgroundSize="150% 150%"
      animation={`${magicBg()} 3s ease infinite`}
    >
      <Flex position="absolute" top="0" left="0" width="100%" height="100%">
        <Box as="img" src="/images/bns-icon.webp" />
      </Flex>
      <Flex flexDirection="column" height="100%">
        <Box flexGrow={1} width="100%"></Box>
        <Box>
          <Text
            variant="Body01"
            color="white"
            fontSize="22px !important"
            fontWeight="500 !important"
          >
            {name}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export const LoadableNameCard: React.FC<{
  children?: React.ReactNode;
  id: number;
  size?: string;
}> = ({ id, size }) => {
  const name = useAtomValue(nameByIdState(id));

  return <NameCard name={name.combined} size={size} />;
};
