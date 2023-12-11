/// <reference types="vitest" />
import { defineConfig } from 'vite';
// import viteTsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { join } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/margarita-form',

  plugins: [
    dts({
      entryRoot: 'src',
      tsConfigFilePath: join(__dirname, 'tsconfig.lib.json'),
      skipDiagnostics: true,
    }),
    /*
    viteTsConfigPaths({
      root: '../../',
    }),
    */
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  // Configuration for building your library.
  // See: https://vitejs.dev/guide/build.html#library-mode
  build: {
    outDir: '../../dist/libs/margarita-form',
    reportCompressedSize: true,
    commonjsOptions: { transformMixedEsModules: true },
    lib: {
      name: 'margarita-form',
      entry: {
        index: 'src/index.ts',
        'light/index': 'src/light.ts',
        /* Validators */
        'validators/index': 'src/lib/validators/index.ts',
        'validators/add-default-validators': 'src/lib/validators/add-default-validators',
        'validators/add-all-validators': 'src/lib/validators/add-all-validators',
        /* Managers */
        'managers/config-manager': 'src/lib/managers/margarita-form-config-manager.ts',
        'managers/controls-manager': 'src/lib/managers/margarita-form-controls-manager.ts',
        'managers/events-manager': 'src/lib/managers/margarita-form-events-manager.ts',
        'managers/field-manager': 'src/lib/managers/margarita-form-field-manager.ts',
        'managers/params-manager': 'src/lib/managers/margarita-form-params-manager.ts',
        'managers/ref-manager': 'src/lib/managers/margarita-form-ref-manager.ts',
        'managers/state-manager': 'src/lib/managers/margarita-form-state-manager.ts',
        'managers/value-manager': 'src/lib/managers/margarita-form-value-manager.ts',
        /* Extensions */
        'extensions/i18n-extension': 'src/lib/extensions/i18n/i18n-extension.ts',
        'extensions/storage-extension-base': 'src/lib/extensions/storage/storage-extension-base.ts',
        'extensions/browser-local-storage': 'src/lib/extensions/storage/browser-local-storage.ts',
        'extensions/browser-search-params-storage': 'src/lib/extensions/storage/browser-search-params-storage.ts',
        'extensions/browser-session-storage': 'src/lib/extensions/storage/browser-session-storage.ts',
        'extensions/syncronization-extension-base': 'src/lib/extensions/syncronization/syncronization-extension-base.ts',
        'extensions/browser-syncronization': 'src/lib/extensions/syncronization/browser-syncronization.ts',
      },
      fileName: (format, entryName) => {
        const ext = format === 'es' ? 'js' : format;
        const parts = entryName.split('/');
        if (parts.length > 1) {
          const name = parts.at(-1);
          const path = parts.slice(0, -1).join('/');
          return `${path}/${name}.${ext}`;
        }

        return `${entryName}.${ext}`;
      },
      // Change this to the formats you want to support.
      // Don't forgot to update your package.json as well.
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['rxjs', 'nanoid'],
    },
  },
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/libs/margarita-form',
      provider: 'v8',
    },
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
