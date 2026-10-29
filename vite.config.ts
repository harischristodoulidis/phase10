import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';

// https://vite.dev/config/
export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    jsxSingleQuote: false,
    trailingComma: 'es5',
    arrowParens: 'always',
    tabWidth: 2,
    useTabs: false,
    printWidth: 100,
    bracketSpacing: true,
    bracketSameLine: false,
    semi: true,
    endOfLine: 'lf',
    insertFinalNewline: true,
    sortImports: {
      newlinesBetween: true,
      internalPattern: [
        '@/',
        '@app/',
        '@features/',
        '@shared/',
        '@ui/',
        '@lib/',
        '@styles/',
        '@assets/',
      ],
      customGroups: [
        { groupName: 'react', elementNamePattern: ['react', 'react-dom', 'react-dom/**'] },
        { groupName: 'app', elementNamePattern: ['@app/**', '@features/**'] },
        {
          groupName: 'shared',
          elementNamePattern: [
            '@/**',
            '@shared/**',
            '@ui/**',
            '@lib/**',
            '@styles/**',
            '@assets/**',
          ],
        },
      ],
      groups: [
        'react',
        ['builtin', 'external'],
        'app',
        'shared',
        ['parent', 'sibling', 'index'],
        'style',
        'unknown',
      ],
    },
  },
  lint: {
    plugins: ['react', 'typescript', 'oxc', 'import'],
    rules: {
      'react/rules-of-hooks': 'error',
      'react/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
      'react/no-array-index-key': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-non-null-assertion': 'error',
      'typescript/ban-ts-comment': ['error', { 'ts-expect-error': 'allow-with-description' }],
      'typescript/consistent-type-imports': 'error',
      'typescript/consistent-type-definitions': ['error', 'type'],
      'typescript/switch-exhaustiveness-check': 'error',
      'import/no-default-export': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*/**'],
              message: "Import other features through their barrel: '@features/<name>'.",
            },
          ],
        },
      ],
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    overrides: [
      {
        files: ['src/**/*.tsx'],
        rules: {
          'max-lines': ['error', { max: 100, skipBlankLines: false, skipComments: false }],
        },
      },
      {
        files: ['src/main.tsx'],
        rules: {
          'typescript/no-non-null-assertion': 'off',
        },
      },
      {
        files: ['*.config.ts'],
        rules: {
          'import/no-default-export': 'off',
        },
      },
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: 'vite-plus',
        specifier: 'vite-plus/oxlint-plugin',
      },
    ],
  },
  resolve: {
    // Path aliases are defined once, in tsconfig.app.json "paths".
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
  },
  plugins: lazyPlugins(() => [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]),
});
