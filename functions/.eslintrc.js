/* eslint-disable */

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "single"],
    indent: 0,
    "no-tabs": 0,
    "max-len": 0,
    "object-curly-spacing": ["error", "always"],
    "import/no-unresolved": 0,
    "operator-linebreak": 0,
  },
};
