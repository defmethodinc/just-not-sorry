const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['options'],
      filename: 'options.html',
      template: 'options/options.ejs',
      templateParameters: {
        allWarnings: require('./src/warnings/phrases.json'),
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'manifest.json' },
        { from: 'just-not-sorry.css' },
      ],
    }),
  ],
  mode: 'production',
  entry: {
    bundle: './src/index.js',
    options: './options/options.js',
    background: './background/background.js',
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx']],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devtool: 'inline-source-map',
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9021,
  },
};
