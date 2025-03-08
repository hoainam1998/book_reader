const HtmlWebpackPlugin = require('html-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const sass = require('sass');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { DefinePlugin } = require('webpack');
const { getResolvePath, getAssetPath } = require('./utils.js');
const { OUTPUT_DIR, PUBLIC, PUBLIC_PATH } = require('./config.js');
const { dev } = require('../config');
const breakPoint = require('../src/static/js/break-point.js');

// process.env.BASE_URL at here was config by docker,
// if it exist, then app is running by docker.
const env = {
  'process.env': JSON.stringify(dev),
  ...process.env.BASE_URL ? {
    'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL)
  } : {}
};

module.exports = {
  entry: getResolvePath('../src/index.tsx'),
  output: {
    filename: 'js/[name].bundle.js',
    path: getResolvePath(OUTPUT_DIR),
    publicPath: PUBLIC_PATH,
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Book Reader',
      favicon: getAssetPath(PUBLIC, 'book.png'),
      template: getAssetPath(PUBLIC, 'index.html')
    }),
    new DefinePlugin(env),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new ESLintPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'utils': getResolvePath('../src/utils'),
      'components': getResolvePath('../src/components'),
      'images': getResolvePath('../src/static/images'),
      'views': getResolvePath('../src/views'),
      'interfaces': getResolvePath('../src/interfaces/index.ts'),
      'hooks': getResolvePath('../src/hooks'),
      'services': getResolvePath('../src/services'),
      'storage': getResolvePath('../src/storage'),
      'store': getResolvePath('../src/store'),
      'paths': getResolvePath('../src/router/paths.ts'),
      'contexts': getResolvePath('../src/contexts'),
      'read-only-variables': getResolvePath('../src/read-only-variables/index.ts'),
      'enums': getResolvePath('../src/enums/index.ts'),
      'decorators': getResolvePath('../src/decorators/index.ts'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(png|jpg|jpeg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'image/[hash][ext][query]'
        }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(c|sa|sc)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              additionalData: `
              @use "sass:math";
              @import "src/static/scss/_colors.scss";
              @import "src/static/scss/_responsive.scss";`,
              sassOptions: {
                functions: {
                  'getResponsiveBreakpoint($key)': function(key) {
                    const point = key.getValue();
                    return new sass.types.String(`${breakPoint[point] || 0}px`);
                  }
                }
              }
            },
          }
        ]
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
        generator: {
          dataUrl: content => {
            content = content.toString();
            return svgToMiniDataURI(content);
          }
        }
      }
    ]
  }
};
