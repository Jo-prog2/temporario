module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // Adicione ou ajuste regras específicas
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
  },
};
