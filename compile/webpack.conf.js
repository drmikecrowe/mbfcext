var fs = require('fs')
var path = require('path')
var webpack = require('webpack')

var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var GenerateJsonPlugin = require('generate-json-webpack-plugin')
var WriteFilePlugin = require('write-file-webpack-plugin')
var LiveReloadPlugin = require('webpack-weex-livereload-plugin')
var ZipPlugin = require('zip-webpack-plugin')

var production = process.env.NODE_ENV === "production"
var target = process.env.TARGET || "chrome"
var environment = process.env.NODE_ENV || "development"

var generic = JSON.parse(fs.readFileSync(`./config/${environment}.json`))
var specific = JSON.parse(fs.readFileSync(`./config/${target}.json`))
var context = Object.assign({}, generic, specific)

var manifestTemplate = JSON.parse(fs.readFileSync(`./manifest.json`))
var manifestOptions = {
  firefox: {
    "applications": {
      "gecko": {
        "id": "my-app-id@mozilla.org"
      }
    }
  }
}
var manifest = Object.assign(
    {},
    manifestTemplate,
    target === 'firefox' ? manifestOptions.firefox : {}
)

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

function replaceQuery(query) {
  return `/* @echo ${query} */`
}

function copy(context, from, to) {
  return { context, from, to }
}

var webpackConfig = {
  entry: {
    background: './src/scripts/background.ts',
    contentscript: './src/scripts/contentscript.tsx',
    options: ['./src/scripts/options.tsx', './src/styles/options.scss'],
    popup: ['./src/scripts/popup.tsx', './src/styles/popup.scss']
  },
  output: {
    path: resolve(`build/${target}`),
    filename: 'scripts/[name].js',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json', '.sass', '.scss'],
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
        test: /\.tsx?$/,
        loader: 'ts-loader',
        include: [resolve('src')]
      },
      {
        test: /\.tsx?$/,
        loader: 'string-replace-loader',
        query: {
          multiple: Object.keys(context).map(function(key) {
            return {
              search: replaceQuery(key),
              replace: context[key]
            }
          })
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader','sass-loader']
        })
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      copy('./src/icons', '**/*', `icons`),
      copy('./src/_locales', '**/*', `_locales`),
      copy(`./src/images`, '**/*', `images`),
      copy('./src/images/shared', '**/*', `images`),
      copy('./src', '**/*.html', `.`),
    ]),
    new GenerateJsonPlugin(`manifest.json`, manifest),
    new ExtractTextPlugin(`styles/[name].css`),
    new webpack.DefinePlugin({
      'process.env': require(`../env/${environment}.env`)
    })
  ]
}

if (production) {
  webpackConfig.output.path = resolve(`dist/${target}`)
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new UglifyJsPlugin({
      uglifyOptions: {
        mangle: false,
        output: { ascii_only: true }
      }
    }),
    new ZipPlugin({ filename: `${target}.zip` })
  ])
} else {
  webpackConfig.entry.background = [
    './src/scripts/livereload.ts',
    './src/scripts/background.ts'
  ]
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new WriteFilePlugin(),
    new LiveReloadPlugin({ port: 35729, message: 'reload' })
  ])
}

module.exports = webpackConfig
