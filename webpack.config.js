//@ts-check

'use strict';

const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require('webpack')

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
  target: 'node',
  entry: {
    extension: './src/extension.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};

/**@type {import('webpack').Configuration}*/
const pageConfig = {
  entry: {
    page: './src/page.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      raphaelmin: path.join(__dirname, 'node_modules/raphael/raphael.no-deps.min.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
      { test: /(\.woff|\.woff2)$/, loader: 'ignore-loader' },
      { test: /\.ttf$/, loader: 'ignore-loader' },
      { test: /\.eot$/, loader: 'ignore-loader' },
      { test: /\.svg$/, loader: 'ignore-loader' },
      {
        test: require.resolve('js-sequence-diagrams'),
        loader: 'imports-loader?Raphael=raphaelmin&_=lodash'
      }
    ]
  },
  externals: 'fs',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    })
  ]
}

module.exports = [extensionConfig, pageConfig];
