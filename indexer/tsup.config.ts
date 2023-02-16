import type { Options } from 'tsup';

const modules = ['trpc', 'index', 'zero-width', 'clarigen', 'contracts'];

const external = modules.map(module => `micro-stacks/${module}`);

export const defaultConfig: Options = {
  target: 'node16',
  entry: modules.map(m => `src/client/${m}.ts`),
  minify: true,
  outDir: 'dist',
  dts: true,
  splitting: true,
  external,
  clean: true,
  format: ['esm', 'cjs'],
};

export default defaultConfig;
