import type { Options } from 'tsup';

export const defaultOptions: Options = {
  target: 'node16',
  entry: ['bridge-card/card.js'],
  minify: true,
  clean: false,
  outDir: 'tmp',
  dts: false,
  splitting: false,
  sourcemap: false,
  format: ['cjs'],
};

export default defaultOptions;
