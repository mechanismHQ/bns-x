import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import type { TextVariant } from '../common/theme';
import { baseTheme, textStyles } from '../common/theme';
import clsx from 'clsx';
import type { CSSTypes } from '@nelson-ui/core';

// const { textStyles } = generatedTheme;
const { colors } = baseTheme;

const getDefaultColor = (type?: keyof typeof textStyles): string => {
  switch (type) {
    case 'Body01':
    case 'Body02':
      return '$text';
    case 'Caption01':
    case 'Caption02':
      return '$text-subdued';
    case 'Display01':
    case 'Display02':
    case 'Heading01':
    case 'Heading02':
    case 'Heading03':
    case 'Heading04':
    case 'Heading05':
      return '$text';
    case 'Label01':
    case 'Label02':
    case 'Label03':
      return '$text';
  }
  return '$text';
};

export type TextProps = BoxProps & { variant?: TextVariant };

function getVariantStyles(variant?: TextVariant): CSSTypes {
  if (typeof variant === 'undefined') return {};
  const lower = variant.slice(0, 1).toLowerCase() + variant.slice(1);
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const styles = textStyles[lower] || textStyles[variant];
  if (!textStyles.hasOwnProperty(lower)) {
    console.warn('Only found old theme styles for text variant:', variant);
  }
  return styles;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant, className, css = {}, ...props }, ref) => {
    const color = getDefaultColor(variant);
    console.log(`Variant: ${variant}, color: ${color}`);
    const styles = getVariantStyles(variant);
    if (typeof variant === 'undefined') {
      console.warn('No text style found for variant:', variant);
    }
    return (
      <Box
        className={clsx([className])}
        ref={ref}
        color={color}
        css={{
          ...styles,
          ...css,
        }}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';
