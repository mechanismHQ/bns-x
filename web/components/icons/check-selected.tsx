import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const CheckSelected: React.FC<BoxProps> = props => {
  return (
    <Box {...props}>
      <svg
        width="19"
        height="20"
        viewBox="0 0 19 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.5 19.5C14.7467 19.5 19 15.2467 19 10C19 4.75329 14.7467 0.5 9.5 0.5C4.25329 0.5 0 4.75329 0 10C0 15.2467 4.25329 19.5 9.5 19.5ZM14.1522 6.84781C14.6159 7.31156 14.6159 8.06344 14.1522 8.52719L9.40219 13.2772C8.93844 13.7409 8.18656 13.7409 7.72281 13.2772L5.34781 10.9022C4.88406 10.4384 4.88406 9.68656 5.34781 9.22281C5.81156 8.75906 6.56344 8.75906 7.02719 9.22281L8.5625 10.7581L12.4728 6.84781C12.9366 6.38406 13.6884 6.38406 14.1522 6.84781Z"
          fill="#efefef"
        />
      </svg>
    </Box>
  );
};
