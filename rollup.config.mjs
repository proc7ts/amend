import { externalModules } from '@run-z/rollup-helpers';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';
import sourcemaps from 'rollup-plugin-sourcemaps';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default defineConfig({
  input: {
    amend: './src/index.ts',
  },
  plugins: [
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheRoot: 'target/.rts2_cache',
    }),
    sourcemaps(),
  ],
  external: externalModules(),
  output: {
    dir: '.',
    format: 'esm',
    sourcemap: true,
    entryFileNames: 'dist/[name].js',
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: ['ES2019'],
        compilerOptions: {
          declarationMap: true,
        },
        internal: ['**/impl/**', '**/*.impl'],
      }),
    ],
  },
});
