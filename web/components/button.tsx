import { Box } from '@nelson-ui/react';
import { styled } from '@stitches/react';

export const Button = styled(Box, {
  padding: '20px 24px',
  borderRadius: '12px',
  textAlign: 'center',
  cursor: 'pointer',
  maxWidth: '200px',
  backgroundColor: '$color-slate-300',
  // color: 'white',
  '&:hover': {
    backgroundColor: '$color-slate-400',
  },
});
