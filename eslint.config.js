const nxPlugin = require('@nx/eslint-plugin')
const { FlatCompat } = require('@eslint/eslintrc')
const eslintPluginReact = require('eslint-plugin-react')
const eslintPluginReactHooks = require('eslint-plugin-react-hooks')
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptEslintParser = require('@typescript-eslint/parser')
const globals = require('globals')
const js = require('@eslint/js')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:react/recommended'),
  {
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      '@nx': nxPlugin,
    },
  },
  {
    settings: { 'import/resolver': { typescript: {} } },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 12,
        sourceType: 'module',
      },
      globals: { ...globals.browser, ...globals.es2021 },
    },
  },
  {
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'react/react-in-jsx-scope': 'off',
      'consistent-return': 'off',
      'no-param-reassign': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-props-no-spreading': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'import/prefer-default-export': 'off',
      // 'import/extensions': [
      //   'error',
      //   'ignorePackages',
      //   {
      //     ts: 'never',
      //     tsx: 'never',
      //   },
      // ],
    },
  },
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      'test-results',
      'playwright-report',
      'storybook-static',
      'eslint.config.js',
      '.nx',
    ],
  },
]
