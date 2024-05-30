const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const portfinder = require('portfinder');
const notifier = require('node-notifier');
const { OUTPUT_DIR } = require('./config.js');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const devConfig = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: OUTPUT_DIR,
    open: true,
    hot: true,
    port: 3000,
    historyApiFallback: true,
  },
  optimization: {
    runtimeChunk: 'single'
  }
});

module.exports = () => {
  return new Promise((resolve, reject) => {
    portfinder.basePort = devConfig.devServer.port;
    portfinder.getPort(function (err, port) {
      if (err) {
        notifier.notify({
          title: 'Webpack config port error.',
          message: `Something wrong when using ${port}: ${err.message}`
        });
        reject(err);
      } else {
        devConfig.plugins.push(
          new FriendlyErrorsWebpackPlugin({
            compilationSuccessInfo: {
              messages: ['You application is running here http://localhost:3000']
            },
            onErrors: function (severity, errors) {
              if (severity === 'error') {
                const error = errors[0];
                notifier.notify({
                  title: 'Webpack error',
                  message: severity + ': ' + error.name,
                  subtitle: error.file || ''
                });
              }
            }
          })
        );
        notifier.notify({
          title: 'Webpack config port success.',
          message: `Your application running on ${port}`
        });
        devConfig.devServer.port = port;
        resolve(devConfig);
      }
    });
  });
};
