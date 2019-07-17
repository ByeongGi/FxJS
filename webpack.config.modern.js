const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = env => {
  return {
    mode: env.NODE_ENV || 'development',
    devtool: 'source-map',
    entry: {
      "fx": "./entry.js",
      "fx.min": "./entry.js"
    },
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: '[name].js'
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({
        include: /\.min\.js$/
      })]
    }
  }
};