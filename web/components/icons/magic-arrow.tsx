import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const MagicArrow: React.FC<BoxProps> = props => {
  return (
    <Box {...props}>
      <svg
        width="81"
        height="31"
        viewBox="0 0 81 31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 15L75 15" stroke="url(#paint0_linear_863_634)" strokeWidth="5" />
        <path d="M0 15L75 15" stroke="url(#paint1_linear_863_634)" strokeWidth="5" />
        <path
          d="M63.3125 2L76.6261 15.3136L63.3125 28.6272"
          stroke="url(#paint2_linear_863_634)"
          strokeWidth="5"
        />
        <path
          d="M59 7.48107C55.9069 7.17443 51.8246 3.09217 51.5189 0H51.4811C51.1744 3.09217 47.0922 7.17443 44 7.48107V7.51893C47.0922 7.82464 51.1744 11.9069 51.4811 15H51.5189C51.8246 11.9078 55.9069 7.82556 59 7.51893V7.48107Z"
          fill="white"
        />
        <path
          d="M46 25.9874C43.9379 25.783 41.2164 23.0614 41.0126 21H40.9874C40.783 23.0614 38.0614 25.783 36 25.9874V26.0126C38.0614 26.2164 40.783 28.9379 40.9874 31H41.0126C41.2164 28.9386 43.9379 26.217 46 26.0126V25.9874Z"
          fill="white"
        />
        <path
          d="M32 11.4886C30.1441 11.3047 27.6948 8.8553 27.5114 7H27.4886C27.3047 8.8553 24.8553 11.3047 23 11.4886V11.5114C24.8553 11.6948 27.3047 14.1441 27.4886 16H27.5114C27.6948 14.1447 30.1441 11.6953 32 11.5114V11.4886Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_863_634"
            x1="4.04442"
            y1="18.3519"
            x2="6.29553"
            y2="5.37188"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F8A4E5" />
            <stop offset="0.223958" stopColor="#5E7FFF" />
            <stop offset="0.473858" stopColor="#56F9F4" />
            <stop offset="0.473958" stopColor="#38FBFC" />
            <stop offset="0.570312" stopColor="#FFEFC5" />
            <stop offset="0.794271" stopColor="#F8A4E5" />
            <stop offset="1" stopColor="#38FBFC" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_863_634"
            x1="-4.12527e-07"
            y1="17.9835"
            x2="70.3125"
            y2="17.9834"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0D0D0D" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_863_634"
            x1="19.999"
            y1="-26.3135"
            x2="73.9993"
            y2="12.1861"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F8A4E5" />
            <stop offset="0.223958" stopColor="#5E7FFF" />
            <stop offset="0.473858" stopColor="#56F9F4" />
            <stop offset="0.473958" stopColor="#38FBFC" />
            <stop offset="0.570312" stopColor="#FFEFC5" />
            <stop offset="0.794271" stopColor="#F8A4E5" />
            <stop offset="1" stopColor="#38FBFC" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};
