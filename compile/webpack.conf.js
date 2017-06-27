var fs = require('fs')
var path = require('path')
var webpack = require('webpack')

var production = process.env.NODE_ENV === "production"
var target = process.env.TARGET || "chrome"
var environment = process.env.NODE_ENV || "development"

var generic = JSON.parse(fs.readFileSync(`./config/${environment}.json`))
var specific = JSON.parse(fs.readFileSync(`./config/${target}.json`))
var context = Object.assign({}, generic, specific)

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

function replaceQuery(query) {
  return `/* @echo ${query} */`
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
      },
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        query: {
          multiple: Object.keys(context).map(function(key) {
            return {
              search: replaceQuery(key),
              replace: context[key]
            }
          })
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      output: {
        ascii_only: true
      }
    })
  ]
}

module.exports = webpackConfig
