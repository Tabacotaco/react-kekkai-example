const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  devServer: { port: 4000 },
  entry: { 'index': './src/index.js' },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: '[name].js'
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: './index.html',
      favicon: './public/favicon.ico'
    })
  ],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules)/,
      include: path.resolve('src'),
      use: 'babel-loader'
    }, {
      test: /\.html$/,
      use: 'html-loader'
    }, {
      test: /\.(css|scss)$/,
      use: ExtractTextPlugin.extract({
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
        fallback: 'style-loader'
      })
    }, {
      test: /\.(eot|ttf|woff|woff2|svg|svgz|json|ico)(\?.+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[hash:8].[ext]'
        }
      }]
    }]
  }
};