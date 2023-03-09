import type { ReactElement, ReactNode } from 'react';
import { keyframes } from '@nelson-ui/core';
import { styled } from '@stitches/react';
import Tippy from '@tippyjs/react/headless';
import type { Placement, Props } from 'tippy.js';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import type { BoxProps } from '@nelson-ui/react';

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledTooltip = styled('div', {
  borderRadius: '10px',
  padding: '17px 19px',
  color: '$text',
  backgroundColor: '$grey-900',
  // boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  // boxShadow: 'rgba(255,255,255, 0.2) 0 0 2px',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
    '&[data-state="delayed-open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

export type TippyAttrs = {
  'data-placement': Placement;
  'data-reference-hidden'?: string;
  'data-escaped'?: string;
};

export type TooltipRender = (attrs: TippyAttrs) => ReactNode;

export type TippyProps = Partial<
  Pick<Props, 'trigger' | 'followCursor' | 'placement' | 'hideOnClick' | 'onHidden'>
>;

export const TooltipTippy: React.FC<{
  render: ReactNode;
  children: ReactElement;
  tippyProps?: TippyProps;
  containerProps?: BoxProps;
}> = ({ render, children, tippyProps, containerProps }) => {
  return (
    <Tippy
      {...tippyProps}
      plugins={[followCursor]}
      render={attrs => (
        <StyledTooltip {...containerProps} {...attrs}>
          {render}
        </StyledTooltip>
      )}
    >
      {children}
    </Tippy>
  );
};
