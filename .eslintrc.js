/*global module*/

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "react-app",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "react-hooks"],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
  },
};
