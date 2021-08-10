module.exports = (api) => ({
  presets: [
    [
      '@4c',
      {
        modules: api.env() === 'esm' ? false : 'commonjs',
      },
    ],
    '@babel/typescript',
  ],
  plugins: [api.env() !== 'esm' && 'add-module-exports'].filter(Boolean),
});
