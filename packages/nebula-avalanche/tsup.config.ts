import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  external: [
    'viem',
    '@noir-lang/noir_js',
    '@noir-lang/acvm_js',
    '@noir-lang/noirc_abi',
    '@aztec/bb.js',
    '@neylanxyz/nebula',
  ],
});
