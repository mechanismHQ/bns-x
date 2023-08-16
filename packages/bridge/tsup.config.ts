import type { Options } from 'tsup';

export const defaultOptions: Options = {
  target: 'es2022',
  entry: ['src/index.ts'],
  minify: false,
  clean: true,
  outDir: 'dist',
  dts: true,
  splitting: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
};

export default defaultOptions;
