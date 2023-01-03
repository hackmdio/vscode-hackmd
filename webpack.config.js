//@ts-check

'use strict';

const path = require('path');

const cloneDeep = require('lodash/cloneDeep');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const extensionConfig = {
  target: 'node',
  entry: {
    extension: './src/extension.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
  ],
  performance: {
    hints: false,
  },
};

const browserTargetConfig = cloneDeep(extensionConfig);

browserTargetConfig.mode = 'none';
browserTargetConfig.target = 'webworker';
browserTargetConfig.output = {
  path: path.join(__dirname, './dist/web'),
  libraryTarget: 'commonjs',
  devtoolModuleFilenameTemplate: '../[resource-path]',
};
browserTargetConfig.resolve = {
  mainFields: ['browser', 'module', 'main'],
  extensions: ['.ts', '.js', '.tsx'],
  fallback: {
    path: require.resolve('path-browserify'),
  },
};
browserTargetConfig.devtool = 'nosources-source-map';
browserTargetConfig.plugins = [
  new webpack.ProvidePlugin({
    process: 'process/browser',
    React: 'react',
  }),
  new webpack.EnvironmentPlugin({
    RUNTIME: 'browser',
  }),
];

/**@type {import('webpack').Configuration}*/
const pageConfig = {
  entry: {
    page: './src/page.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      os: false,
      https: false,
      http: false,
      crypto: false,
      fs: false,
      path: false,
    },
    alias: {
      raphael: path.join(__dirname, 'node_modules/raphael/raphael.min.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      { test: /(\.woff|\.woff2)$/, loader: 'ignore-loader' },
      { test: /\.ttf$/, loader: 'ignore-loader' },
      { test: /\.eot$/, loader: 'ignore-loader' },
      { test: /\.svg$/, loader: 'ignore-loader' },
      {
        test: require.resolve('js-sequence-diagrams'),
        use: [
          {
            loader: 'imports-loader',
            options: {
              imports: ['default raphael Raphael', 'default lodash _'],
            },
          },
        ],
      },
    ],
  },
  externals: 'fs',
  devtool: 'source-map',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
};

module.exports = [extensionConfig, pageConfig, browserTargetConfig];
