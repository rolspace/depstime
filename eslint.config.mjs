import globals from 'globals'
import neostandard from 'neostandard'

export default [
  ...neostandard(),
  {
    ignores: ['**/.nyc_output', '**/dist', '**/coverage', '**/node_modules'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/multiline-ternary': 'off',
      'brace-style': ['error', '1tbs', {
        allowSingleLine: false,
      }],
      curly: ['error', 'all'],
      'prefer-destructuring': ['error', {
        array: true,
        object: true,
      }, {
        enforceForRenamedProperties: true,
      }],
      quotes: ['error', 'single'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
    },
  },
]
