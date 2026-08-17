//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-optional-chain': 'off',
      'pnpm/json-enforce-catalog': 'off',
      'max-lines': [
        'warn',
        { max: 700, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      // Ignore generated/platform assets that aren't part of the TS project
      'android/**',
      'ios/**',
      'public/**',
      'android/**/public/**',
      'ios/**/public/**',
      'android/app/src/main/assets/**',
    ],
  },
]
