import React from 'react';
import type { BoxProps } from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';
import type { TextVariant } from '../common/theme';
import { textStyles } from '../common/theme';
import clsx from 'clsx';
import type { CSSTypes } from '@nelson-ui/core';

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
    case 'Heading035':
    case 'Heading04':
    case 'Heading05':
    case 'Heading06':
      return '$text';
    case 'Label01':
    case 'Label02':
    case 'Label03':
      return '$text';
  }
  return '$text';
};

type BP = '@initial' | '@bp1' | '@bp2' | '@bp3';

export type ResponsiveVariant = Record<BP, TextVariant>;

export type TextProps = BoxProps & { variant?: TextVariant | ResponsiveVariant };

function getVariantStyles(variant: TextVariant): CSSTypes {
  if (typeof variant === 'undefined') return {};
  const lower = variant.slice(0, 1).toLowerCase() + variant.slice(1);

  const styles = textStyles[lower] || textStyles[variant];
  // if (!textStyles.hasOwnProperty(lower)) {
  //   console.warn('Only found old theme styles for text variant:', variant);
  // }
  return styles || {};
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'Body01', className, css = {}, ...props }, ref) => {
    const baseVariant = typeof variant === 'string' ? variant : variant['@initial'];
    const color = getDefaultColor(baseVariant);
    // const styles = getVariantStyles(baseVariant);
    const responsiveVariant: ResponsiveVariant =
      typeof variant === 'string'
        ? ({
            '@initial': baseVariant,
          } as ResponsiveVariant)
        : variant;
    // const colorObj = Object.fromEntries(
    //   Object.entries(responsiveVariant).map(([bp, v]) => {
    //     return [bp, getDefaultColor(v)];
    //   })
    // ) as Record<BP, string>;
    const stylesObj = Object.fromEntries(
      Object.entries(responsiveVariant).map(([bp, v]) => {
        if (v === 'Display02') {
          console.log(getVariantStyles(v));
        }
        return [bp, getVariantStyles(v)];
      })
    ) as Record<BP, CSSTypes>;
    if (typeof variant === 'object') {
      console.log(stylesObj);
    }
    if (typeof variant === 'undefined') {
      console.warn('No text style found for variant:', variant);
    }
    return (
      <Box
        className={clsx([className])}
        ref={ref}
        color={color}
        css={{
          ...stylesObj,
          ...stylesObj['@initial'],
          ...css,
        }}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';
