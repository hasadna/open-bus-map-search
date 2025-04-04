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
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      '@nx': nxPlugin,
      import: eslintPluginImport,
    },
  },
  {
    settings: { 'import/resolver': { typescript: {} }, react: { version: 'detect' } },
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
      ...typescriptEslintEslintPlugin.configs['recommended-requiring-type-checking'].rules,
      ...eslintPluginReact.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint.no-unsafe-assignment': 'off',
      'import/no-unused-modules': 'error',
      'import/order': 'error',
      'prettier/prettier': [
        'error',
        {
          semi: false,
          tabWidth: 2,
          printWidth: 100,
          singleQuote: true,
          trailingComma: 'all',
          bracketSameLine: true,
          jsxSingleQuote: false,
          endOfLine: 'auto',
        },
      ],
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
      'jest.config.ts',
      'sitemap.js',
      'public',
    ],
  },
]
