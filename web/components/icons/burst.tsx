import React from 'react';
import { Box } from '@nelson-ui/react';

export const BurstIcon: React.FC = () => {
  return (
    <Box display="inline-block" height="30px" width="30px">
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        preserveAspectRatio="xMinYMin"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M15.0002 0L21.0713 14.9998L15.0002 30L8.92844 14.9998L15.0002 0Z" fill="#F3BD27" />
        <path
          d="M-2.65406e-07 14.9995L14.9998 8.92843L30 14.9995L14.9998 21.0713L-2.65406e-07 14.9995Z"
          fill="#F3BD27"
        />
        <path
          d="M4.39388 4.39281L19.2932 10.7063L25.6071 25.606L10.7069 19.2926L4.39388 4.39281Z"
          fill="#F3BD27"
        />
        <path
          d="M4.39345 25.6063L10.707 10.707L25.6067 4.39313L19.2933 19.2933L4.39345 25.6063Z"
          fill="#F3BD27"
        />
      </svg>
    </Box>
  );
};
