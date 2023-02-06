import { Text } from '@components/text';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import type { VariantProps } from '@stitches/react';
import { styled } from '@stitches/react';
import { keyframes } from '@nelson-ui/core';
import { useCallback, useState } from 'react';

const move = keyframes({
  from: {
    top: '0px',
  },
  to: {
    top: '3px',
  },
});

export const ButtonComp = styled(Box, {
  padding: '14px 24px',
  borderRadius: '50px',
  textAlign: 'center',
  cursor: 'pointer',
  display: 'inline-block',
  backgroundColor: '$text',
  color: '$surface-surface',
  '&:hover': {
    backgroundColor: '$slate-300',
    // top: '3px',
  },
  '&:active': {
    animation: `${move()} 50ms ease`,
    animationFillMode: 'forwards',
  },
  // animation: `top 50ms ease`,
  // '&.btn-clicked': {
  //   // top: '3px',
  //   animation: `${move} 50ms ease`,
  //   animationFillMode: 'forwards',
  // },
  variants: {
    disabled: {
      true: {
        backgroundColor: '$primary-action-subdued',
        color: '$onSurface-text-subdued',
        '&:hover': {
          backgroundColor: '$primary-action-subdued',
          color: '$onSurface-text-subdued',
        },
        pointerEvents: 'none',
      },
    },
    type: {
      big: {
        padding: '20px 24px',
        width: '260px',
        borderRadius: '50px',
      },
    },
    secondary: {
      true: {
        border: '1px solid $onSurface-border',
        background: 'none',
        color: '$text',
        '&:hover': {
          background: 'none',
        },
      },
    },
  },
});

export const Button: React.FC<
  BoxProps &
    VariantProps<typeof ButtonComp> & {
      magic?: boolean;
    }
> = ({ children, type, ...props }) => {
  return (
    <Box height={type === 'big' ? '64px' : '48px'} position="relative">
      <ButtonComp {...props} type={type} position="relative">
        <Text
          className="button-text"
          variant={type === 'big' ? 'Label01' : 'Label02'}
          color="inherit"
        >
          {children}
        </Text>
      </ButtonComp>
    </Box>
  );
};
