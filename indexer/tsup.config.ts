import type { Options } from 'tsup';

export const defaultConfig: Options = {
  target: 'node16',
  entry: ['src/export-types.ts'],
  minify: true,
  outDir: 'dist',
  dts: true,
  splitting: true,
  clean: true,
  format: ['esm', 'cjs'],
};

export default defaultConfig;
