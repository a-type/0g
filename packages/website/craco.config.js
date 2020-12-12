const path = require('path');

module.exports = {
  webpack: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'babel-loader': path.resolve('./node_modules/babel-loader'),
    },
  },
  babel: {
    presets: ['@emotion/babel-preset-css-prop']
  }
};
