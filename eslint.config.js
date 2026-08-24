import js from '@eslint/js';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly',
        console: 'readonly', URL: 'readonly', Blob: 'readonly', FileReader: 'readonly', alert: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly', crypto: 'readonly', React: 'readonly'
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
