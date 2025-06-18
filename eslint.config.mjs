// @ts-check
import eslint from '@eslint/js';
import stylistic from "@stylistic/eslint-plugin";
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "@stylistic/indent": ["error", 2],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/block-spacing": ["error", "always"],
      "@stylistic/brace-style": ["error", "stroustrup"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/key-spacing": ["error", { beforeColon: false, afterColon: true }],
    },
  },
);