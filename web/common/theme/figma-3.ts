const theme = {
  global: {
    'text-alert-red': {
      value: '#ed5653',
      type: 'color',
    },
    'text-error-subdued': {
      value: '#A9413F',
      type: 'color',
    },
    'text-error': {
      value: '#ED5653',
      type: 'color',
    },
    'Color–Surface–Error': {
      value: '#140b0a',
      type: 'color',
    },
    'Surface–Error–Border–Subdued': {
      value: '#451312',
      type: 'color',
    },
    foil: {
      value:
        'linear-gradient(134deg, #f8a4e5 0%, #5e7fff 27.86%, #56f9f4 47.39%, #38fbfc 47.4%, #ffefc5 57.03%, #f8a4e5 79.43%, #38fbfc 100%)',
      type: 'color',
    },
    'text-onsurface-very-dim': {
      value: '#404040',
      type: 'color',
    },
    'dark-surface-warning': {
      value: '#120e09',
      type: 'color',
    },
    'dark-border-warning-subdued': {
      value: '#453112',
      type: 'color',
    },
    'foli-logo': {
      value:
        'linear-gradient(134deg, #f8a4e5 0%, #5e7fff 23.44%, #38fbfc 47.4%, #56f9f4 53.13%, #ffefc5 64.58%, #f8a4e5 73.96%, #38fbfc 100%)',
      type: 'color',
    },
    'orange-btc': {
      value: '#de8d14',
      type: 'color',
    },
    'orange-xbtc': {
      value: '#eb9615',
      type: 'color',
    },
    'gray-hover': {
      value: '#444444',
      type: 'color',
    },
    'dark-surface-very-subdued': {
      value: '#121212',
      type: 'color',
    },
    'dark-success-border-subdued': {
      value: '#103b2b',
      type: 'color',
    },
    'dark-surface-success-subdued': {
      value: '#0b120f',
      type: 'color',
    },
    'text-very-dim': {
      value: '#4d4d4d',
      type: 'color',
    },
    fontFamilies: {
      'ibm-plex-mono': {
        value: 'IBM Plex Mono',
        type: 'fontFamilies',
      },
      inter: {
        value: 'Inter',
        type: 'fontFamilies',
      },
      'open-sauce-one': {
        value: 'Open Sauce One',
        type: 'fontFamilies',
      },
    },
    lineHeights: {
      '0': {
        value: '32',
        type: 'lineHeights',
      },
      '1': {
        value: '24',
        type: 'lineHeights',
      },
      '2': {
        value: '20',
        type: 'lineHeights',
      },
      '3': {
        value: '16',
        type: 'lineHeights',
      },
      '4': {
        value: '80',
        type: 'lineHeights',
      },
      '5': {
        value: '72',
        type: 'lineHeights',
      },
      '6': {
        value: '60',
        type: 'lineHeights',
      },
      '7': {
        value: '56',
        type: 'lineHeights',
      },
      '8': {
        value: '44',
        type: 'lineHeights',
      },
      '9': {
        value: '36',
        type: 'lineHeights',
      },
      '10': {
        value: '28',
        type: 'lineHeights',
      },
    },
    fontWeights: {
      'ibm-plex-mono-0': {
        value: 'Medium',
        type: 'fontWeights',
      },
      'inter-1': {
        value: 'Medium',
        type: 'fontWeights',
      },
      'inter-2': {
        value: 'Regular',
        type: 'fontWeights',
      },
      'open-sauce-one-3': {
        value: 'Medium',
        type: 'fontWeights',
      },
    },
    fontSize: {
      '0': {
        value: '12',
        type: 'fontSizes',
      },
      '1': {
        value: '14',
        type: 'fontSizes',
      },
      '2': {
        value: '16',
        type: 'fontSizes',
      },
      '3': {
        value: '18',
        type: 'fontSizes',
      },
      '4': {
        value: '20',
        type: 'fontSizes',
      },
      '5': {
        value: '24',
        type: 'fontSizes',
      },
      '6': {
        value: '32',
        type: 'fontSizes',
      },
      '7': {
        value: '40',
        type: 'fontSizes',
      },
      '8': {
        value: '48',
        type: 'fontSizes',
      },
      '9': {
        value: '64',
        type: 'fontSizes',
      },
      '10': {
        value: '72',
        type: 'fontSizes',
      },
    },
    letterSpacing: {
      '0': {
        value: '0%',
        type: 'letterSpacing',
      },
      '1': {
        value: '-1%',
        type: 'letterSpacing',
      },
      '2': {
        value: '-2%',
        type: 'letterSpacing',
      },
    },
    paragraphSpacing: {
      '0': {
        value: '0',
        type: 'paragraphSpacing',
      },
      '1': {
        value: '7',
        type: 'paragraphSpacing',
      },
    },
    Annotate: {
      fontFamily: {
        value: '$fontFamilies.ibm-plex-mono',
        type: 'fontFamily',
      },
      fontWeight: {
        value: '$fontWeights.ibm-plex-mono-0',
        type: 'fontWeight',
      },
      lineHeight: {
        value: '$lineHeights.0',
        type: 'lineHeight',
      },
      fontSize: {
        value: '$fontSize.3',
        type: 'fontSize',
      },
      letterSpacing: {
        value: '$letterSpacing.0',
        type: 'letterSpacing',
      },
      paragraphSpacing: {
        value: '$paragraphSpacing.0',
        type: 'paragraphSpacing',
      },
      textCase: {
        value: '$textCase.none',
        type: 'textCase',
      },
      textDecoration: {
        value: '$textDecoration.none',
        type: 'textDecoration',
      },
    },
    Label: {
      Label01: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-1',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.1',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.2',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Label02: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-1',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.2',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.1',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Label03: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-1',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.2',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.0',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
    },
    Caption: {
      Caption01: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-2',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.2',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.1',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Caption02: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-2',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.3',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.0',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.0',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
    },
    Body: {
      Body02: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-2',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.2',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.1',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.1',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Body01: {
        fontFamily: {
          value: '$fontFamilies.inter',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.inter-2',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.1',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.2',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
    },
    Display: {
      Display01: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.4',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.10',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.2',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Display02: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.5',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.9',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.2',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
    },
    Heading: {
      Heading01: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.6',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.8',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.2',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Heading02: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.7',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.7',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.2',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Heading03: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.8',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.6',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.2',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Heading04: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.9',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.5',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
      Heading05: {
        fontFamily: {
          value: '$fontFamilies.open-sauce-one',
          type: 'fontFamily',
        },
        fontWeight: {
          value: '$fontWeights.open-sauce-one-3',
          type: 'fontWeight',
        },
        lineHeight: {
          value: '$lineHeights.10',
          type: 'lineHeight',
        },
        fontSize: {
          value: '$fontSize.4',
          type: 'fontSize',
        },
        letterSpacing: {
          value: '$letterSpacing.1',
          type: 'letterSpacing',
        },
        paragraphSpacing: {
          value: '$paragraphSpacing.0',
          type: 'paragraphSpacing',
        },
        textCase: {
          value: '$textCase.none',
          type: 'textCase',
        },
        textDecoration: {
          value: '$textDecoration.none',
          type: 'textDecoration',
        },
      },
    },
    textCase: {
      none: {
        value: 'none',
        type: 'textCase',
      },
    },
    textDecoration: {
      none: {
        value: 'none',
        type: 'textDecoration',
      },
    },
  },
} as const;

export const figma = theme.global;

export const colors: Record<string, string> = {};

Object.entries(figma).forEach(([color, data]) => {
  if ('type' in data && data.type === 'color') {
    colors[color] = data.value;
  }
});
