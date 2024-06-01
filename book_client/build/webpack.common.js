const HtmlWebpackPlugin = require('html-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { DefinePlugin } = require('webpack');
const path = require('path');
const { getResolvePath, getAssetPath } = require('./utils.js');
const { OUTPUT_DIR, PUBLIC, PUBLIC_PATH } = require('./config.js');
const { dev } = require('../config');

module.exports = {
  entry: getResolvePath('../src/index.tsx'),
  output: {
    filename: 'js/[name].bundle.js',
    path: path.join(__dirname, OUTPUT_DIR),
    publicPath: PUBLIC_PATH,
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Book Reader',
      favicon: getAssetPath(PUBLIC, 'book.png'),
      template: getAssetPath(PUBLIC, 'index.html')
    }),
    new DefinePlugin({
      'process.env': JSON.stringify(dev)
    }),
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
      'interfaces': getResolvePath('../src/interfaces'),
      'hooks': getResolvePath('../src/hooks'),
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
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              additionalData: '@import "src/static/scss/_colors.scss";',
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
