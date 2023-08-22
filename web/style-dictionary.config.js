module.exports = {
  source: [`tw-conf/**/*.json`],
  // If you don't want to call the registerTransform method a bunch of times
  // you can override the whole transform object directly. This works because
  // the .extend method copies everything in the config
  // to itself, allowing you to override things. It's also doing a deep merge
  // to protect from accidentally overriding nested attributes.
  // transform: {
  //   // Now we can use the transform 'myTransform' below
  //   myTransform: {
  //     type: 'name',
  //     transformer: (token) => token.path.join('_').toUpperCase()
  //   }
  // },
  // // Same with formats, you can now write them directly to this config
  // // object. The name of the format is the key.
  format: {
    customJS: ({ dictionary, platform }) => {
      console.log(dictionary.allTokens);
      return dictionary.allTokens.map(token => `${token.name}: ${token.value}`).join('\n');
    },
  },
  platforms: {
    js: {
      transformGroup: 'js',
      files: [
        {
          format: 'javascript/module-flat',
          destination: 'tw-conf/design-token.js',
        },
        {
          format: 'javascript/es6',
          destination: 'tw-conf/color-tokens.ts',
          filter: {
            attributes: {
              category: 'color',
            },
          },
        },
        {
          format: 'javascript/es6',
          destination: 'tw-conf/font-tokens.ts',
          transforms: ['name/ti/constant'],
          filter: {
            attributes: {
              category: 'font',
            },
          },
        },
        // {
        //   format: 'customJS',
        //   destination: 'conf/design-token2.js',
        // },
      ],
    },
  },
};
