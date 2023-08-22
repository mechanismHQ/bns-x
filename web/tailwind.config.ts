import type { Config } from 'tailwindcss';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tailwindAnimate from 'tailwindcss-animate';
import * as tokens from './tw-conf/color-tokens';
import * as fontTokens from './tw-conf/font-tokens';

const tokenColors: Record<string, string> = {};

const scaleColors: Record<string, Record<number, string>> = {};

function convertCamelCaseToKebabCase(str: string) {
  let colorStr = '';
  str.split('').forEach(char => {
    if (!Number.isNaN(parseInt(char, 10))) {
      colorStr += char;
    } else if (char === char.toUpperCase()) {
      const pre = colorStr.length > 0 ? '-' : '';
      colorStr += `${pre}${char.toLowerCase()}`;
    } else {
      colorStr += char;
    }
  });
  return colorStr;
}

Object.entries(tokens).forEach(([key, value]) => {
  let colorStr = '';
  key
    .slice('color'.length)
    .split('')
    .forEach(char => {
      if (!Number.isNaN(parseInt(char, 10))) {
        colorStr += char;
      } else if (char === char.toUpperCase()) {
        const pre = colorStr.length > 0 ? '-' : '';
        colorStr += `${pre}${char.toLowerCase()}`;
      } else {
        colorStr += char;
      }
    });
  // match strings ending with 3 digits:
  const match = colorStr.match(/(\d{3})$/);
  if (match !== null) {
    // console.log('match');
    // console.log(match);
    const scale = Number(match[1]);
    const color = colorStr.slice(0, match.index);
    if (!scaleColors[color]) {
      scaleColors[color] = {};
    }
    scaleColors[color]![scale] = value;
  } else {
    let colorToken = colorStr;
    // strip "dark-onsurface"
    if (colorStr.startsWith('dark-onsurface')) {
      tokenColors[colorStr] = value;
      colorToken = colorStr.slice('dark-onsurface-'.length);
    }
    tokenColors[colorToken] = value;
  }
});

const fontSizes: Record<
  string,
  [string, { lineHeight: string; letterSpacing: string; fontWeight: string; fontSize: string }]
> = {};

Object.entries(fontTokens).forEach(([key, value]) => {
  const kebabKey = convertCamelCaseToKebabCase(key);
  const [_f, _t, type] = kebabKey.split('-');
  fontSizes[type!] = [
    `${value.fontSize}px`,
    {
      lineHeight: `${value.lineHeight}px`,
      letterSpacing: `${value.letterSpacing}px`,
      fontWeight: value.fontWeight.toString(10),
      fontSize: `${value.fontSize}px`,
    },
  ];
  // fontSizes[[type, size].join('-')] = {
  //   lineHeight: `${value.lineHeight}px`,
  //   letterSpacing: `${value.letterSpacing}px`,
  //   fontWeight: value.fontWeight.toString(10),
  //   fontSize: `${value.fontSize}px`,
  // };
});

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      colors: {
        ...tokenColors,
      },
      fontSize: fontSizes,
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
