const { defineConfig, globalIgnores } = require('eslint/config');
const babelParser = require('@babel/eslint-parser');
const globals = require('globals');
const js = require('@eslint/js');

const GLOBALS_BROWSER_FIX = Object.assign({}, globals.browser, {
  AudioWorkletGlobalScope: globals.browser['AudioWorkletGlobalScope '],
});

delete GLOBALS_BROWSER_FIX['AudioWorkletGlobalScope '];

module.exports = defineConfig([
  {
    files: ['**/*.js'],
    plugins: {
      js,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        ...GLOBALS_BROWSER_FIX,
      },
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
      },
    },
    extends: ['js/recommended'],
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
  globalIgnores(['./dist/index.js', '__test__/coverage']),
]);
