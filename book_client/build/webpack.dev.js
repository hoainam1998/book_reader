const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { OUTPUT_DIR } = require('./config.js');
const portfinder = require('portfinder');
const notifier = require('node-notifier');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const devConfig = (env) => merge(common(env), {
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

module.exports = (env) => {
  const developmentConfig = devConfig(env);
  return new Promise((resolve, reject) => {
    portfinder.basePort = developmentConfig.devServer.port;
    portfinder.getPort(function (err, port) {
      if (err) {
        notifier.notify({
          title: 'Webpack config port error.',
          message: `Something wrong when using ${port}: ${err.message}`
        });
        reject(err);
      } else {
        developmentConfig.plugins.push(
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
        developmentConfig.devServer.port = port;
        resolve(developmentConfig);
      }
    });
  });
};
