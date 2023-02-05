import type { Options } from 'tsup';

export const defaultConfig: Options = {
  target: 'node16',
  entry: ['src/client/index.ts'],
  minify: true,
  outDir: 'dist',
  dts: true,
  splitting: true,
  format: ['esm', 'cjs'],
};

export default defaultConfig;
