module.exports = {
  extends: [
    '4catalyzer-react',
    '4catalyzer-jest',
    '4catalyzer-typescript',
    'prettier',
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
