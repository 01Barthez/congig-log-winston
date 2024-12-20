import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";

export default {
  files: ["**/*.{js,mjs,cjs,ts}"],
  languageOptions: {
    globals: globals.browser,
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: "./tsconfig.json",
    },
  },
  plugins: {
    "@typescript-eslint": tseslint,
    prettier: prettierPlugin,
  },
  ignores: ["node_modules/", "dist/", "jest.config.ts", ".gitignore"],
  rules: {
    "prettier/prettier": "error",
    camelcase: "error",
    "spaced-comment": "error",
    quotes: ["error", "single"],
    "no-duplicate-imports": "error",
    "no-unused-vars": "off",
    "no-magic-numbers": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-magic-numbers": "error",
  },
  extends: [
    "standard-with-typescript",
    "plugin:prettier/recommended",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    pluginJs.configs.recommended,
    tseslint.configs.recommended,
  ],
};
