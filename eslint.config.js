import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/* One config for the whole workspace — frontend, dashboard and packages/*.
 *
 * There used to be two byte-identical copies of this file, one per app, and a
 * rule added to one would silently not apply to the other. Run it from the
 * repo root with `npm run lint`; the per-app `npm run lint` scripts now
 * delegate here rather than carrying their own toolchain.
 *
 * The backend is not a workspace and is not linted by this config. */

export default [
  { ignores: ['**/dist', '**/node_modules', 'backend'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      // 'latest' so optional chaining, nullish coalescing and optional catch
      // binding all parse. The old 2020 target predates some of them.
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // This project validates props with neither PropTypes nor TypeScript, so
      // the rule only produces noise on every presentational component.
      'react/prop-types': 'off',

      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Entry points: they render the app and export nothing, so React Fast
    // Refresh does not apply to them.
    files: ['**/src/main.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Barrel files re-export components and nothing else; Fast Refresh has
    // nothing to attach to and the warning is noise.
    files: ['packages/*/src/index.js'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Config files and the contrast checker run in Node, not the browser.
    files: ['**/*.config.js', '**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
]
