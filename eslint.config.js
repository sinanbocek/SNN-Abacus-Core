import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['coverage/**', 'dist/**'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      'no-restricted-properties': [
        'error',
        {
          property: 'toLocaleString',
          message: 'toLocaleString kullanımı yasaktır. Lütfen ABACUS motorunu (money/date) kullanın.',
        },
        {
          property: 'toFixed',
          message: 'toFixed kullanımı yasaktır. Lütfen ABACUS math/money motorunu kullanın.',
        },
        {
          property: 'toLowerCase',
          message: 'Ham toLowerCase kullanımı yasaktır. Lütfen ABACUS text (lower/toTrLower/toAsciiLower) kullanın.',
        },
        {
          property: 'toUpperCase',
          message: 'Ham toUpperCase kullanımı yasaktır. Lütfen ABACUS text (upper) kullanın.',
        },
      ],
      // ABACUS-SPEC §0.5 / §4.5 ve AI-RULES §3: hata `null` ile döner,
      // sessiz `|| 0` / `?? 0` varsayılanı yasaktır. Kural artık makinede zorlanır.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'LogicalExpression[operator="||"][right.type="Literal"][right.value=0]',
          message:
            'Sessiz `|| 0` varsayılanı yasaktır (ABACUS-SPEC §0.5). null durumunu açıkça ele alın.',
        },
        {
          selector: 'LogicalExpression[operator="??"][right.type="Literal"][right.value=0]',
          message:
            'Sessiz `?? 0` varsayılanı yasaktır (ABACUS-SPEC §0.5). null durumunu açıkça ele alın.',
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'parseFloat',
          message: 'Ham parseFloat kullanımı yasaktır. Lütfen ABACUS math/money motorunu kullanın.',
        },
        {
          name: 'Math',
          message: 'Ham Math kullanımı yasaktır. Lütfen ABACUS math motorunu veya decimal.js kullanın.',
        },
        {
          name: 'Intl',
          message: 'Ham Intl kullanımı yasaktır. Lütfen ABACUS date/money motorunu kullanın.',
        },
      ],
    },
  },
];
