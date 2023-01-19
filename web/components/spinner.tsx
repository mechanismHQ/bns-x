import { keyframes } from '@nelson-ui/core';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import React from 'react';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const Spinner: React.FC<BoxProps & { size?: number }> = props => {
  const size = props.size || 16;
  const radius = size / 2;
  return (
    <Box
      size={size}
      backgroundImage="conic-gradient(from 0deg at 50% 50%, rgba(255, 255, 255, 0) 0deg, #FFFFFF 360deg)"
      p="2px"
      borderRadius={radius}
      animation={`${spin()} 1s linear infinite`}
      {...props}
    >
      <Box size={size - 4} borderRadius="50%" backgroundColor="$background" />
    </Box>
  );
};
