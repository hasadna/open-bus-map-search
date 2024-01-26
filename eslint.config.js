import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import functional from 'eslint-plugin-functional'
import imprt from 'eslint-plugin-import' // 'import' is ambiguous & prettier has trouble
import react from 'eslint-plugin-react'
import sb from 'eslint-plugin-storybook'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    files: ['./src/**/*.{ts,tsx, scss}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: 'latest',
        project: './tsconfig.json',
      },
    },
    plugins: {
      functional,
      import: imprt,
      '@typescript-eslint': ts,
      ts,
      react,
      sb,
      prettier,
    },
    rules: {
      ...ts.configs['eslint-recommended'].rules,
      ...ts.configs['recommended'].rules,
      ...ts.configs['recommended-requiring-type-checking'].rules,
      ...react.configs['recommended'].rules,
      ...sb.configs['recommended'].rules,
      ...prettier.configs['recommended'].rules,
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
]
