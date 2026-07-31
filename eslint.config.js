import { FlatCompat } from '@eslint/eslintrc'
import eslintJs from '@eslint/js'
import nxPlugin from '@nx/eslint-plugin'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'
import eslintPluginI18next from 'eslint-plugin-i18next'
import eslintPluginPlaywright from 'eslint-plugin-playwright'
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
  // User-visible strings must go through i18next, so every language gets them
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.{ts,tsx}', 'src/test_pages/**'],
    plugins: { i18next: eslintPluginI18next },
    rules: {
      'i18next/no-literal-string': [
        'error',
        {
          mode: 'jsx-only',
          'jsx-attributes': {
            include: ['label', 'aria-label', 'alt', 'title', 'placeholder'],
          },
        },
      ],
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
  // Playwright hygiene for e2e specs — the high-value rules that catch no-op /
  // broken assertions, not the full recommended set.
  {
    files: ['tests/**/*.{ts,tsx}'],
    plugins: { playwright: eslintPluginPlaywright },
    rules: {
      // Un-awaited web-first assertions never fail the test.
      'playwright/missing-playwright-await': 'error',
      // Matcher-less or out-of-test expect() asserts nothing.
      'playwright/valid-expect': 'error',
      'playwright/no-standalone-expect': 'error',
      // Ban zero-assertion tests; assertFunctionNames whitelists expect()-wrapping helpers.
      'playwright/expect-expect': ['error', { assertFunctionNames: ['verifyDateFromParameter'] }],
    },
  },
  // No expect() by design: Applitools screenshots / HAR recorder.
  {
    files: ['tests/visual.spec.ts', 'tests/recordHAR.spec.ts'],
    rules: { 'playwright/expect-expect': 'off' },
  },
]
