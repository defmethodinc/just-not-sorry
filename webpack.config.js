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
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
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
            plugins: [
              ["@babel/plugin-transform-react-jsx", { "pragma":"h" }]
            ]
          }
        }
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    "alias": {
      "react": "preact/compat",
      "react-dom": "preact/compat"
    }
  },
  devtool: false,
};
