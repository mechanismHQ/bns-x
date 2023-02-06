const figma = {
  global: {
    'Color-White': {
      value: '#ffffff',
      type: 'color',
    },
    'Color-Alert-Red': {
      value: '#ed5653',
      type: 'color',
    },
    'Color-Warning': {
      value: '#f59300',
      type: 'color',
    },
    Primary: {
      'Color-Primary': {
        value: '#5432ff',
        type: 'color',
      },
      'Color-Primary-Text': {
        value: '#684aff',
        type: 'color',
      },
      'Color-Primary-Magic-Hover': {
        value: 'linear-gradient(225deg, #48dd81 0%, #ee3698 47.71%, #7543ff 100%)',
        type: 'color',
      },
      'Color-Primary-Disabled': {
        value: '#33218b',
        type: 'color',
      },
    },
    Surface: {
      'Color-Background': {
        value: '#0d0a17',
        type: 'color',
      },
      'Color-Border-Subdued': {
        value: '#241c4f',
        type: 'color',
      },
      'Color-Surface': {
        value: '#141029',
        type: 'color',
      },
      'Color-Surface-200': {
        value: '#1c1733',
        type: 'color',
      },
      'Color-Surface-Error': {
        value: '#240b13',
        type: 'color',
      },
      'color-surface-error': {
        value: '#140b0a',
        type: 'color',
      },
      'Surface-Error-Border-Subdued': {
        value: '#711d1c',
        type: 'color',
      },
      'border-error': {
        value: '#451312',
        type: 'color',
      },
    },
    Brand: {
      'Color-Zelda': {
        value: '#f3bd27',
        type: 'color',
      },
      'Color-BTC': {
        value: '#f08800',
        type: 'color',
      },
    },
    Slate: {
      'Color-Slate-95': {
        value: '#e7e6f2',
        type: 'color',
      },
      'Color-Slate-90': {
        value: '#d0cee5',
        type: 'color',
      },
      'Color-Slate-85': {
        value: '#bbb8d9',
        type: 'color',
      },
      'Color-Slate-75': {
        value: '#9e9bbf',
        type: 'color',
      },
      'Color-Slate-80': {
        value: '#aaa7cc',
        type: 'color',
      },
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
        value: '500',
        type: 'fontWeights',
      },
      'inter-1': {
        value: '500',
        type: 'fontWeights',
      },
      'inter-2': {
        value: '400',
        type: 'fontWeights',
      },
      'open-sauce-one-3': {
        value: '500',
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
      value: {
        fontFamily: '$fontFamilies.ibm-plex-mono',
        fontWeight: '$fontWeights.ibm-plex-mono-0',
        lineHeight: '$lineHeights.0',
        fontSize: '$fontSize.3',
        letterSpacing: '$letterSpacing.0',
        paragraphSpacing: '$paragraphSpacing.0',
        textCase: '$textCase.none',
        textDecoration: '$textDecoration.none',
      },
      type: 'typography',
    },
    Label: {
      Label01: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-1',
          lineHeight: '$lineHeights.1',
          fontSize: '$fontSize.2',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Label02: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-1',
          lineHeight: '$lineHeights.2',
          fontSize: '$fontSize.1',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Label03: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-1',
          lineHeight: '$lineHeights.2',
          fontSize: '$fontSize.0',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
    },
    Caption: {
      Caption01: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-2',
          lineHeight: '$lineHeights.2',
          fontSize: '$fontSize.1',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Caption02: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-2',
          lineHeight: '$lineHeights.3',
          fontSize: '$fontSize.0',
          letterSpacing: '$letterSpacing.0',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
    },
    Body: {
      Body02: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-2',
          lineHeight: '$lineHeights.2',
          fontSize: '$fontSize.1',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.1',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Body01: {
        value: {
          fontFamily: '$fontFamilies.inter',
          fontWeight: '$fontWeights.inter-2',
          lineHeight: '$lineHeights.1',
          fontSize: '$fontSize.2',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
    },
    Display: {
      Display01: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.4',
          fontSize: '$fontSize.10',
          letterSpacing: '$letterSpacing.2',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Display02: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.5',
          fontSize: '$fontSize.9',
          letterSpacing: '$letterSpacing.2',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
    },
    Heading: {
      Heading01: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.6',
          fontSize: '$fontSize.8',
          letterSpacing: '$letterSpacing.2',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading02: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.7',
          fontSize: '$fontSize.7',
          letterSpacing: '$letterSpacing.2',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading022: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '36px',
          fontSize: '22px',
          letterSpacing: '$letterSpacing.2',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading03: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.8',
          fontSize: '$fontSize.6',
          letterSpacing: '$letterSpacing.2',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading035: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '44px',
          fontSize: '28px',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading04: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.9',
          fontSize: '$fontSize.5',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading05: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '$lineHeights.10',
          fontSize: '$fontSize.4',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
      },
      Heading06: {
        value: {
          fontFamily: '$fontFamilies.open-sauce-one',
          fontWeight: '$fontWeights.open-sauce-one-3',
          lineHeight: '28px',
          fontSize: '18px',
          letterSpacing: '$letterSpacing.1',
          paragraphSpacing: '$paragraphSpacing.0',
          textCase: '$textCase.none',
          textDecoration: '$textDecoration.none',
        },
        type: 'typography',
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
};

export default figma.global;
