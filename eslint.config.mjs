import sanityI18n from '@sanity/eslint-plugin-i18n'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'
import noComments from 'eslint-plugin-no-comments'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'app/generated/**',
    'prisma/migrations/**',
    'node_modules/**',
    'app/globals.css',
  ]),

  {
    plugins: { 'no-comments': noComments },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      curly: ['error', 'multi'],
      'no-comments/disallowComments': 'error',
    },
  },

  {
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    plugins: { '@sanity/i18n': sanityI18n },
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: [
            ':',
            '/',
            '(',
            ')',
            '-',
            '•',
            '©',
            '+',
            '%',
            ' ',
            '"',
            '👔',
            '🏥',
            '⚕️',
            '❓',
            '⚠️',
            '🟢',
            '🟡',
            '🔴',
            '⚫',
          ],
        },
      ],
      '@sanity/i18n/no-attribute-string-literals': [
        'error',
        {
          mode: 'extend',
          ignores: {
            or: [
              {
                attributes: [
                  'size',
                  'variant',
                  'attribute',
                  'defaultTheme',
                  'position',
                  'translationNamespace',
                ],
              },
            ],
          },
        },
      ],
      '@sanity/i18n/no-attribute-template-literals': ['error', { mode: 'extend' }],
    },
  },
])

export default eslintConfig
