const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { DefinePlugin } = require('webpack');
const { prod } = require('../config');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify(prod)
    })
  ],
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
});
