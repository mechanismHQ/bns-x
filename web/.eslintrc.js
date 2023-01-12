module.exports = {
  extends: ['@stacks/eslint-config', 'next/core-web-vitals'],
  settings: {
    react: {
      version: '999.999.999',
    },
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['unused-imports'],
  rules: {
    '@typescript-eslint/no-unused-vars': [0],
    '@typescript-eslint/explicit-module-boundary-types': [0],
    '@typescript-eslint/no-non-null-assertion': [0],
    '@typescript-eslint/consistent-type-imports': [1],
    '@typescript-eslint/strict-boolean-expressions': [
      2,
      {
        allowNullableString: true,
        allowNullableBoolean: true,
      },
    ],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
  },
};
