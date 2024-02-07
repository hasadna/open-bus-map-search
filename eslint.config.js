const nxPlugin = require('@nx/eslint-plugin')
const { FlatCompat } = require('@eslint/eslintrc')
const eslintPluginReact = require('eslint-plugin-react')
const eslintPluginReactHooks = require('eslint-plugin-react-hooks')
const eslintPluginImport = require('eslint-plugin-import')
const typescriptEslintEslintPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptEslintParser = require('@typescript-eslint/parser')
const globals = require('globals')
const js = require('@eslint/js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:react/recommended'),
  eslintPluginPrettierRecommended,
  {
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      '@nx': nxPlugin,
      import: eslintPluginImport,

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
        project: './tsconfig.json',
      },
      globals: { ...globals.browser, ...globals.es2021 },
    },
  },
  {
    rules: {
      ...typescriptEslintEslintPlugin.configs.recommended.rules,
      ...eslintPluginReact.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      ...typescriptEslintEslintPlugin.configs['eslint-recommended'].rules,
      ...typescriptEslintEslintPlugin.configs['recommended'].rules,
      ...typescriptEslintEslintPlugin.configs['recommended-requiring-type-checking'].rules,
      ...eslintPluginReact.configs['recommended'].rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // ...eslintPluginImport.configs.recommended.rules,
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'prettier/prettier': ['error', {
        "semi": false,
        "tabWidth": 2,
        "printWidth": 100,
        "singleQuote": true,
        "trailingComma": "all",
        "bracketSameLine": true,
        "jsxSingleQuote": false,
        "endOfLine": "auto",
      }],
    },
  },
  {
    ignores: [
      'dist',
      'coverage',
      'test-results',
      'playwright-report',
      'storybook-static',
      'eslint.config.js',
      '.nx',
    ],
  },
]
