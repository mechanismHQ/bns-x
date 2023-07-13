import type { Options } from 'tsup';

export const defaultOptions: Options = {
  target: 'node16',
  entry: ['src/index.ts'],
  minify: false,
  outDir: 'dist',
  dts: true,
  splitting: true,
  format: ['esm', 'cjs'],
};

export default defaultOptions;
