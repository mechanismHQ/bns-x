import { keyframes } from '@nelson-ui/core';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import React from 'react';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const Spinner: React.FC<BoxProps> = props => {
  const size = 16;
  const radius = size / 2;
  return (
    <Box
      size={size}
      backgroundImage="conic-gradient(from 134.29deg at 51.84% 49.4%, #F8A4E5 0deg, #5E7FFF 114.38deg, #38FBFC 219.37deg, #FFEFC5 236.25deg, #F8A4E5 360deg)"
      p="2px"
      borderRadius={radius}
      animation={`${spin()} 1s linear infinite`}
      {...props}
    >
      <Box size={size - 4} borderRadius="50%" backgroundColor="$background" />
    </Box>
  );
};
