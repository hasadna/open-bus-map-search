import { FlatCompat } from '@eslint/eslintrc'
import eslintJs from '@eslint/js'
import nxPlugin from '@nx/eslint-plugin'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: eslintJs.configs.recommended,
})

export default [
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:storybook/recommended',
  ),
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
      '*.js',
      '*.cjs',
    ],
  },
  {
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      '@nx': nxPlugin,
    },
  },
  {
    settings: {
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
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/react-in-jsx-scope': 'off',
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // Prettier
      'prettier/prettier': 'error',
    },
  },
  // Disable React rules in tests and test_pages folders
  {
    files: ['tests/**/*.{ts,tsx}', 'src/test_pages/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react/jsx-filename-extension': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
]
