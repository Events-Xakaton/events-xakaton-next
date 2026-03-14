const config = {
  plugins: {
    'postcss-nested': {},
    '@tailwindcss/postcss': {
      optimize: false,
    },
    autoprefixer: {},
    'postcss-lightningcss': {
      minify: true,
    },
  },
};

export default config;
