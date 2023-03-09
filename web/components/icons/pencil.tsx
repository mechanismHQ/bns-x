import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const PencilIcon: React.FC<BoxProps> = props => {
  return (
    <Box display="inline-block" height="16px" width="16px" {...props}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_294_2238)">
          <path
            d="M11.3335 2.00004C11.5086 1.82494 11.7165 1.68605 11.9452 1.59129C12.174 1.49653 12.4192 1.44775 12.6668 1.44775C12.9145 1.44775 13.1597 1.49653 13.3884 1.59129C13.6172 1.68605 13.8251 1.82494 14.0002 2.00004C14.1753 2.17513 14.3142 2.383 14.4089 2.61178C14.5037 2.84055 14.5524 3.08575 14.5524 3.33337C14.5524 3.58099 14.5037 3.82619 14.4089 4.05497C14.3142 4.28374 14.1753 4.49161 14.0002 4.66671L5.00016 13.6667L1.3335 14.6667L2.3335 11L11.3335 2.00004Z"
            stroke="#9A9A9A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_294_2238">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  );
};
