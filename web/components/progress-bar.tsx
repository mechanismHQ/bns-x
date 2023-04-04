import React, { useMemo } from 'react';
import { Stack, Box, Flex } from '@nelson-ui/react';
import { keyframes } from '@nelson-ui/core';

const bgAnimation = keyframes({
  from: {
    backgroundPosition: '0 0',
  },
  to: {
    backgroundPosition: '-200% 0',
  },
});

export interface ProgressProps {
  value: number;
  pending: boolean;
}

export const ProgressBar: React.FC<{ children?: React.ReactNode } & ProgressProps> = ({
  value,
  pending,
}) => {
  // const barWidth = useMemo(() => {
  //   return Math.max(value, 3);
  // }, [value]);

  const barStyles = useMemo(() => {
    if (pending) {
      return {
        bg: {
          backgroundColor: '$blue-300',
        },
        bar: {
          // backgroundColor: '$blue-600',
          background:
            'repeating-linear-gradient(to right, var(--colors-blue-500) 0%, var(--colors-blue-600) 50%, var(--colors-blue-500) 100%)',
          animation: `${bgAnimation()} 1s infinite`,
          animationFillMode: 'forwards',
          animationTimingFunction: 'linear',
          backgroundSize: '200% auto',
        },
      };
    } else {
      return {
        bg: {
          backgroundColor: '$green-300',
        },
        bar: {
          backgroundColor: '$green-600',
        },
      };
    }
  }, [pending]);
  return (
    <Box
      position="relative"
      height="8px"
      transition="all 1s ease"
      filter={pending ? 'drop-shadow(0px 0px 4px #5546FF)' : ''}
    >
      <Box
        transition="all 1s ease"
        width="100%"
        height="100%"
        {...barStyles.bg}
        borderRadius="4px"
      ></Box>
      <Box
        transition="all 1s ease"
        position="absolute"
        top="0"
        height="100%"
        {...barStyles.bar}
        borderRadius="4px"
        width={`${value}%`}
      ></Box>
    </Box>
  );
};
