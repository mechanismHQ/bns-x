import { Box } from '@nelson-ui/react';
import { styled } from '@stitches/react';

export const Button = styled(Box, {
  padding: '14px 24px',
  borderRadius: '50px',
  textAlign: 'center',
  cursor: 'pointer',
  // maxWidth: '200px',
  display: 'inline-block',
  backgroundColor: '$text',
  color: '$surface-surface',
  fontFamily: 'Inter',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '$grey-100',
  },
});
