import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const LogoIcon: React.FC<BoxProps & { size?: string }> = React.forwardRef(
  ({ size = '28', ...props }, ref) => {
    return (
      <Box
        size={`${size}px`}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ref={ref as any}
        {...props}
      >
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
      </Box>
    );
  }
);

LogoIcon.displayName = 'LogoIcon';
