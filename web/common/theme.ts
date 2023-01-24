/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { borderRadius, boxShadow, colors, fonts, fontSizes, sizes } from '@nelson-ui/theme';
import type { CSSTypes } from '@nelson-ui/core';
import { makeColors, createTheme, getCssText as nelsonCss } from '@nelson-ui/core';
import figma from './theme/figma';
import { tokens } from './theme/figma-2';
import { colors as colors3 } from './theme/figma-3';
import type { PropertyValue } from '@stitches/react';
import { createStitches } from '@stitches/react';
import fsTokens from './theme/fs-tokens2.json';

function transformProps(props: Record<string, { value: any }>, suffix = '') {
  return Object.fromEntries(
    Object.entries(props).map(([key, val]) => {
      const v = suffix ? `${String(val.value)}${suffix}` : val.value;
      return [key, v];
    })
  );
}

export function makeTheme() {
  const {
    Primary,
    Surface,
    Brand,
    Slate,
    fontFamilies,
    lineHeights,
    fontSize,
    letterSpacing,
    paragraphSpacing,
    Label,
    Caption,
    Body,
    Display,
    Heading,
    textCase,
    textDecoration,
    fontWeights,
    Annotate,
    ...BaseColors
  } = figma;
  const colors: Record<string, string> = {};
  const textStyles: Record<string, any> = {};
  [Label, Caption, Body, Display, Heading].forEach(dict => {
    Object.entries(dict).forEach(([variant, styles]) => {
      const css: Record<string, string> = {};
      Object.entries(styles.value).forEach(([key, val]) => {
        if (key === 'text-decoration') return;
        if (val.startsWith('$')) {
          const [_, ...rest] = val.split('.');
          css[key] = `$${rest.join('-')}`;
        } else {
          css[key] = val;
        }
      });
      textStyles[variant] = css;
    });
  });
  [BaseColors, Primary, Surface, Brand, Slate].forEach(dict => {
    Object.entries(dict).forEach(([key, v]) => {
      try {
        colors[key.toLowerCase().replace(/–/g, '-')] = v.value;
      } catch (error) {
        console.error(error);
        console.log(key, v.value);
      }
    });
  });
  return {
    colors: {
      ...colors,
      background: colors['color-background'] ?? '',
      'color-base-black': colors['color-background'] ?? '',
      text: '$color-slate-90',
    },
    textStyles,
    fontFamilies: transformProps(fontFamilies),
    fontWeights: transformProps(fontWeights),
    fontSizes,
  };
}

export function newFsColors() {
  const colors: Record<string, string> = {};
  Object.entries(fsTokens.dark).forEach(([key, group]) => {
    Object.entries(group).forEach(([color, data]) => {
      const item = `${key}-${color}`;
      colors[`dark-${item}`] = data.value;
      colors[item] = data.value;
      if (key === 'onSurface') {
        colors[color] = data.value;
      }
    });
  });
  Object.entries(fsTokens.light).forEach(([key, group]) => {
    Object.entries(group).forEach(([color, data]) => {
      const item = `light-${key}-${color}`;
      colors[item] = data.value;
    });
  });
  Object.entries(fsTokens.base).forEach(([key, val]) => {
    colors[`color-${key}`] = val.value;
    colors[key] = val.value;
  });
  ['slate', 'grey', 'blue', 'green', 'orange', 'red'].forEach(base => {
    const items = fsTokens[base as keyof typeof fsTokens];
    Object.entries(items).forEach(([layer, val]) => {
      colors[`color-${base}-${layer}`] = val.value;
      colors[`${base}-${layer}`] = val.value;
    });
  });
  return colors;
}

export function makeNewTheme() {
  const { color } = tokens;
  const colors: Record<string, string> = {};

  // let key: keyof typeof color;
  // for (key in color) {
  //   colors[key] = color[key].value;
  // }
  const { label, caption, body, display, heading, ...fonts } = tokens.font;
  const textStyles: Record<string, CSSTypes> = {};
  [label, caption, body, display, heading].forEach(group => {
    Object.entries(group).forEach(([key, val]) => {
      const style = val.value;
      textStyles[key] = {
        ...style,
        fontSize: `${style.fontSize}px`,
        lineHeight: `${style.lineHeight}px`,
        letterSpacing: `${style.letterSpacing}px`,
      };
      // const val: CSSTypes = group[key as keyof ].value;
    });
  });
  return {
    colors: transformProps(tokens.color),
    textStyles,
    // textStyles: {
    //   ...transformProps(caption),
    //   ...transformProps(label),
    //   ...transformProps(body),
    //   ...transformProps(display),
    //   ...transformProps(heading),
    // },
  };
}

export type OldTextVariant =
  | keyof typeof figma['Body']
  | keyof typeof figma['Caption']
  | keyof typeof figma['Heading']
  | keyof typeof figma['Label']
  | keyof typeof figma['Display'];

export type NewTextVariant =
  | Capitalize<keyof typeof tokens['font']['body']>
  | Capitalize<keyof typeof tokens['font']['caption']>
  | Capitalize<keyof typeof tokens['font']['heading']>
  | Capitalize<keyof typeof tokens['font']['label']>
  | Capitalize<keyof typeof tokens['font']['display']>;

export type TextVariant = OldTextVariant | NewTextVariant;

export const generatedTheme = makeTheme();
export const newTheme = makeNewTheme();

export const textStyles: Record<string, CSSTypes> = {
  ...generatedTheme.textStyles,
  ...newTheme.textStyles,
};

const fsColors = newFsColors();

export const baseTheme = {
  colors: {
    ...colors.foundation,
    ...makeColors('dark'),
    ...generatedTheme.colors,
    ...newTheme.colors,
    ...fsColors,
    ...colors3,
    text: fsColors['onSurface-text'] ?? '',
    background: '#0c0c0d',
    'foil-radial':
      'conic-gradient(from 134.29deg at 51.84% 49.4%, #F8A4E5 0deg, #5E7FFF 114.38deg, #38FBFC 219.37deg, #FFEFC5 236.25deg, #F8A4E5 360deg)',
  },
  space: {
    ...sizes,
    'row-x': '30px',
    'row-y': '30px',
  },
  // fontSizes,
  fontSizes: generatedTheme.fontSizes,
  fonts: {
    ...fonts,
    ...transformProps(figma.fontFamilies),
  },
  fontFamilies: generatedTheme.fontFamilies,
  fontWeights: {
    light: 300,
    base: 400,
    semibold: 500,
    bold: 600,
    extrabold: 700,
    ...generatedTheme.fontWeights,
  },
  lineHeights: transformProps(figma.lineHeights, 'px'),
  letterSpacings: transformProps(figma.letterSpacing),
  paragraphSpacing: transformProps(figma.paragraphSpacing, 'px'),
  sizes: {},
  borderWidths: {
    base: '1px',
    medium: '2px',
    thick: '3px',
  },
  borderStyles: {
    base: 'solid',
  },
  radii: borderRadius,
  shadows: boxShadow,
  zIndices: {
    base: 10,
    mid: 50,
    high: 100,
    highest: 99,
  },
  transitions: {
    slow: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
    base: 'all 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
    fast: 'all 0.125s cubic-bezier(0.23, 1, 0.32, 1)',
  },
};

export const { styled, getCssText } = createStitches({
  theme: baseTheme,
  media: {
    bp1: '(max-width: 640px)',
    bp2: '(min-width: 768px)',
    bp3: '(min-width: 1024px)',
    sm: '(max-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    initial: '',
  },
  utils: {
    m: (value: PropertyValue<'margin'>) => ({
      margin: value,
    }),
    mt: (value: PropertyValue<'margin'>) => ({
      marginTop: value,
    }),
    mr: (value: PropertyValue<'margin'>) => ({
      marginRight: value,
    }),
    mb: (value: PropertyValue<'margin'>) => ({
      marginBottom: value,
    }),
    ml: (value: PropertyValue<'margin'>) => ({
      marginLeft: value,
    }),
    mx: (value: PropertyValue<'margin'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: PropertyValue<'margin'>) => ({
      marginTop: value,
      marginBottom: value,
    }),
    p: (value: PropertyValue<'padding'>) => ({
      padding: value,
    }),
    pt: (value: PropertyValue<'padding'>) => ({
      paddingTop: value,
    }),
    pr: (value: PropertyValue<'padding'>) => ({
      paddingRight: value,
    }),
    pb: (value: PropertyValue<'padding'>) => ({
      paddingBottom: value,
    }),
    pl: (value: PropertyValue<'padding'>) => ({
      paddingLeft: value,
    }),
    px: (value: PropertyValue<'padding'>) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: PropertyValue<'padding'>) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    size: (value: PropertyValue<'width'>) => ({
      width: value,
      height: value,
    }),
    w: (value: PropertyValue<'width'>) => ({
      width: value,
    }),
  },
});

export const darkMode = createTheme('dark-mode', baseTheme);

export function allCss() {
  return `${nelsonCss()}\n${getCssText()}`;
}
// console.log(theme.colors.background);
