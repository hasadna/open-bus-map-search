import { defineConfig } from 'eslint/config'
import nxPlugin from '@nx/eslint-plugin'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginImport from 'eslint-plugin-import'
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptEslintParser from '@typescript-eslint/parser'
import globals from 'globals'
import eslintJs from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default defineConfig([
  {
    extends: [eslintJs.configs.recommended],
    plugins: {
      react: eslintPluginReact,
      'react-hooks': eslintPluginReactHooks,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      '@nx': nxPlugin,
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': { typescript: {} },
      react: { version: 'detect' },
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: { ...globals.browser, ...globals.es2021 },
    },
    rules: {
      ...typescriptEslintEslintPlugin.configs.recommended.rules,
      ...typescriptEslintEslintPlugin.configs['recommended-requiring-type-checking'].rules,
      ...eslintPluginReact.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
      'react/react-in-jsx-scope': 'off',
      'import/no-unused-modules': ['error', { unusedExports: true }],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
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
    ignores: [
      'dist/**/*',
      'coverage/**/*',
      'test-results/**/*',
      'playwright-report/**/*',
      'storybook-static/**/*',
      'eslint.config.js',
      '.nx/**/*',
      'jest.config.ts',
      'sitemap.js',
      'public/**/*',
      '*.har',
    ],
  },
  eslintPluginPrettierRecommended,
])
