const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['options'],
      filename: 'options.html',
      template: 'options/options.ejs',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'manifest.json' },
        { from: 'background', to: 'background' },
        { from: 'just-not-sorry.css' },
      ],
    }),
  ],
  mode: 'production',
  entry: {
    bundle: './src/index.js',
    options: './options/options.js',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'h' }]],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'enzyme-adapter-react-16': 'enzyme-adapter-preact-pure',
    },
  },
  devtool: 'inline-source-map',
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
  },
};
