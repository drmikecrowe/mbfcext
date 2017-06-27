var path = require('path')
var webpack = require('webpack')

var target = process.env.TARGET || "chrome";

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

var webpackConfig = {
  entry: {
    background: './src/scripts/background.js',
    contentscript: './src/scripts/contentscript.js',
    livereload: './src/scripts/livereload.js',
    options: './src/scripts/options.js',
    popup: './src/scripts/popup.js'
  },
  output: {
    path: resolve('dist'),
    filename: target + '/scripts/[name].js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.json', '.sass', '.scss'],
    modules: [
      resolve('src'),
      resolve('node_modules')
    ],
    alias: {
      'src': resolve('src'),
      'actions': resolve('src/scripts/actions'),
      'components': resolve('src/scripts/components'),
      'reducers': resolve('src/scripts/reducers'),
      'services': resolve('src/scripts/services')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src')]
      }
    ]
  }
}

module.exports = webpackConfig
