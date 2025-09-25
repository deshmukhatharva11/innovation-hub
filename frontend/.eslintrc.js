module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-unused-vars': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'eqeqeq': 'warn'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  }
};
