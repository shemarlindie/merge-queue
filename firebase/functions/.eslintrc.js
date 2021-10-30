module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: 8,
  },
  rules: {
    quotes: ["error", "double"],
    indent: ["error", 2],
  },
};
