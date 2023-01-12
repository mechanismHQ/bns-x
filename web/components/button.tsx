import { Box } from '@nelson-ui/react';
import { styled } from '@stitches/react';

export const Button = styled(Box, {
  padding: '20px 24px',
  borderRadius: '12px',
  textAlign: 'center',
  cursor: 'pointer',
  maxWidth: '200px',
  backgroundColor: '$grey-100',
  color: '$surface-surface',
  '&:hover': {
    backgroundColor: '$grey-300',
  },
});
