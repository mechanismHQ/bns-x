import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const LogoIcon: React.FC<BoxProps & { size?: string }> = ({ size = '28', ...props }) => {
  return (
    <Box size={`${size}px`} {...props}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 26C20.6274 26 26 20.6274 26 14C26 7.37258 20.6274 2 14 2C7.37258 2 2 7.37258 2 14C2 20.6274 7.37258 26 14 26ZM14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14C0 21.732 6.26801 28 14 28Z"
          fill="#EFEFEF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.9204 22.9072C19.166 20.7274 20 17.5824 20 14C20 10.4176 19.166 7.27264 17.9204 5.09278C16.6424 2.85635 15.1817 2 14 2C12.8183 2 11.3576 2.85635 10.0796 5.09278C8.834 7.27264 8 10.4176 8 14C8 17.5824 8.834 20.7274 10.0796 22.9072C11.3576 25.1437 12.8183 26 14 26C15.1817 26 16.6424 25.1437 17.9204 22.9072ZM14 28C18.4183 28 22 21.732 22 14C22 6.26801 18.4183 0 14 0C9.58172 0 6 6.26801 6 14C6 21.732 9.58172 28 14 28Z"
          fill="#EFEFEF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 27.5154L13 1.83575e-08L15 0L15 27.5154L13 27.5154Z"
          fill="#EFEFEF"
        />
        <path fillRule="evenodd" clipRule="evenodd" d="M1 13L27 13V15L1 15V13Z" fill="#EFEFEF" />
      </svg>
    </Box>
  );
};
