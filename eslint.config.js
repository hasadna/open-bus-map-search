import nxPlugin from '@nx/eslint-plugin'
import { FlatCompat } from '@eslint/eslintrc'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginImport from 'eslint-plugin-import'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'
import globals from 'globals'
import eslintJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: eslintJs.configs.recommended,
})

export default [
  ...compat.extends('plugin:@typescript-eslint/recommended', 'plugin:react/recommended'),
  eslintPluginPrettierRecommended,
  {
    ignores: [
      'dist',
      'coverage',
      'test-results',
      'playwright-report',
      'storybook-static',
      'public',
      '.nx',
      '**/*.js',
      'applitools.config.cjs',
    ],
  },
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
    settings: {
      'import/resolver': { typescript: true },
      react: { version: 'detect' },
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: { ...globals.browser, ...globals.jest },
    },
  },
  {
    rules: {
      // React
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'react/react-in-jsx-scope': 'off',
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // Import
      'import/no-unused-modules': 'error',
      'import/order': 'error',
      // Prettier
      'prettier/prettier': 'error',
    },
  },
]
