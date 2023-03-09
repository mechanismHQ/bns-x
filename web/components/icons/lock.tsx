import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const LockIcon: React.FC<BoxProps> = props => {
  return (
    <Box display="inline-block" height="16px" width="16px" {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.6667 7.33325H3.33333C2.59695 7.33325 2 7.93021 2 8.66659V13.3333C2 14.0696 2.59695 14.6666 3.33333 14.6666H12.6667C13.403 14.6666 14 14.0696 14 13.3333V8.66659C14 7.93021 13.403 7.33325 12.6667 7.33325Z"
          stroke="#9A9A9A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.6665 7.33325V4.66659C4.6665 3.78253 5.01769 2.93468 5.64281 2.30956C6.26794 1.68444 7.11578 1.33325 7.99984 1.33325C8.88389 1.33325 9.73174 1.68444 10.3569 2.30956C10.982 2.93468 11.3332 3.78253 11.3332 4.66659V7.33325"
          stroke="#9A9A9A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  );
};
