import type { Options } from 'tsup';

export const defaultConfig: Options = {
  target: 'node16',
  entry: ['src/export-types.ts', 'scripts/server.ts'],
  minify: false,
  outDir: 'dist',
  // dts: true,
  sourcemap: true,
  // splitting: true,
  clean: true,
  format: ['esm', 'cjs'],
  publicDir: 'static',
};

export default defaultConfig;
