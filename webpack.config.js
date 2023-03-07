const path = require('path');
const slsw = require('serverless-webpack');

const entries = {};

Object.keys(slsw.lib.entries).forEach(
  key => (entries[key] = ['./source-map-install.js', slsw.lib.entries[key]])
);

module.exports = {
  stats: slsw.lib.webpack.isLocal ? 'minimal' : 'normal',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.webpack.isLocal ? entries : slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal ? 'source-map' : undefined,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  optimization: {
    minimize: !slsw.lib.webpack.isLocal,
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
    ],
  },
};