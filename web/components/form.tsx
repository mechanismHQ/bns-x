import { styled } from '@stitches/react';
import type { ComponentProps } from '@stitches/core';
import { Box } from '@nelson-ui/react';
import { keyframes } from '@nelson-ui/core';

export const Input = styled('input', {
  all: 'unset',
  width: '100%',
  display: 'inline-flex',
  alignItems: 'left',
  justifyContent: 'left',
  textAlign: 'left',
  borderRadius: '$medium',
  border: '1px solid $onSurface-border-subdued',
  padding: '0 18px',
  height: '64px',
  fontSize: '16px',
  lineHeight: 1,
  color: '$text',
  boxSizing: 'border-box',
  backgroundColor: '$dark-surface-very-subdued',
});

export const magicBg = keyframes({
  '0%': { backgroundPosition: '0% 0%' },
  '50%': { backgroundPosition: '100% 100%' },
  '100%': { backgroundPosition: '0% 0%' },
});

export const InputBorder = styled(Box, {
  padding: '1px',
  background: '$border-subdued',
  backgroundSize: '200%',
  borderRadius: '$medium',
  animation: `${magicBg()} 4s ease infinite`,
  '&:focus-within': {
    background: '$foil',
    backgroundSize: '150%',
  },
  input: {
    border: 'none',
  },
});

export const MagicInput: React.FC<ComponentProps<typeof Input>> = props => {
  return (
    <InputBorder>
      <Input {...props} />
    </InputBorder>
  );
};
