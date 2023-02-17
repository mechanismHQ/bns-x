import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const LogoIcon: React.FC<BoxProps & { size?: string }> = ({ size = '28', ...props }) => {
  return (
    <Box size={`${size}px`} {...props}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 75 75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="37.5"
          cy="37.5"
          r="36"
          transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 75 0)"
          stroke="white"
          strokeWidth="3"
        />
        <path
          d="M23.25 37.5C23.25 47.7055 24.9902 56.8742 27.746 63.4357C29.1252 66.7195 30.7293 69.2796 32.4338 70.9961C34.1327 72.7071 35.8435 73.5 37.5 73.5C39.1564 73.5 40.8673 72.7071 42.5662 70.9961C44.2707 69.2796 45.8747 66.7195 47.254 63.4357C50.0098 56.8742 51.75 47.7055 51.75 37.5C51.75 27.2945 50.0098 18.1258 47.254 11.5643C45.8747 8.28051 44.2707 5.7204 42.5662 4.00386C40.8673 2.29294 39.1565 1.5 37.5 1.5C35.8435 1.5 34.1327 2.29293 32.4338 4.00386C30.7293 5.7204 29.1253 8.28051 27.746 11.5643C24.9902 18.1258 23.25 27.2945 23.25 37.5Z"
          stroke="white"
          strokeWidth="3"
        />
        <line
          y1="-1.5"
          x2="67.5"
          y2="-1.5"
          transform="matrix(1 1.74846e-07 1.74846e-07 -1 3.75 24.75)"
          stroke="white"
          strokeWidth="3"
        />
        <line
          y1="-1.5"
          x2="67.5"
          y2="-1.5"
          transform="matrix(1 1.74846e-07 1.74846e-07 -1 3.75 48)"
          stroke="white"
          strokeWidth="3"
        />
      </svg>

      {/* <svg
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
      </svg> */}
    </Box>
  );
};
