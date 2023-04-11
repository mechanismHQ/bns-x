import type { Options } from 'tsup';

export const defaultOptions: Options = {
  target: 'node16',
  entry: ['src/export-types.ts'],
  minify: true,
  outDir: 'dist',
  dts: true,
  splitting: true,
  format: ['esm', 'cjs'],
};

export default defaultOptions;
