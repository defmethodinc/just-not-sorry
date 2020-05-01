const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyPlugin([
      { from: 'img', to: 'img' },
      { from: 'manifest.json' },
      { from: 'options', to: 'options' },
      { from: 'background', to: 'background' },
      { from: 'just-not-sorry.css' },
    ]),
  ],
  mode: 'production',
  entry: './src/JustNotSorry.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
    ],
  },
  devtool: 'inline-source-map',
};
