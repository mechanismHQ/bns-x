import React, { useMemo } from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const StarIcon: React.FC<BoxProps & { h?: number }> = ({ h = 25, ...props }) => {
  const [height, width] = useMemo(() => {
    return [h, h + 1];
  }, [h]);
  return (
    <Box display="inline-block" size={h} {...props}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 25 26"
        preserveAspectRatio="xMinYMin"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24.5475 12.9684C19.4856 12.4574 12.805 5.65362 12.3047 0.5H12.2428C11.741 5.65362 5.06034 12.4574 0 12.9684V13.0316C5.06034 13.5411 11.741 20.3448 12.2428 25.5H12.3047C12.805 20.3464 19.4856 13.5426 24.5475 13.0316V12.9684Z"
          fill="url(#paint0_linear_810_2561)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_810_2561"
            x1="6.23747"
            y1="6.4"
            x2="19.4467"
            y2="19.0587"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F8A4E5" />
            <stop offset="0.234375" stopColor="#5E7FFF" />
            <stop offset="0.473958" stopColor="#38FBFC" />
            <stop offset="0.53125" stopColor="#56F9F4" />
            <stop offset="0.645833" stopColor="#FFEFC5" />
            <stop offset="0.739583" stopColor="#F8A4E5" />
            <stop offset="1" stopColor="#38FBFC" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};
