const { merge } = require("webpack-merge");
const { webpackConfig, target, pkgJson } = require("./webpack.common.js");
const webpack  = require('webpack');

// const FileManagerPlugin = require("filemanager-webpack-plugin");

// const plugins = [
//   new FileManagerPlugin({
//     events: {
//       onEnd: {
//         archive: [
//           {
//             source: `build/${target}/`,
//             destination: `build/${target}-${pkgJson.name}-${pkgJson.version}.zip`,
//           },
//         ],
//       },
//     },
//   }),
// ];

// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//     .BundleAnalyzerPlugin;

// plugins.push(
//     new BundleAnalyzerPlugin({
//         analyzerMode: "static",
//         generateStatsFile: true,
//         reportFilename: `/tmp/report-${target}.html`,
//     })
// );

const config = merge(webpackConfig, {
  devtool: false,
  node: {
    // prevent webpack from injecting eval / new Function through global polyfill
    global: false,
  },
  mode: "production",
  optimization: {
    usedExports: true,
    minimize: false,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.DefinePlugin({
      global: "window",
    }),
  ],
});

module.exports = config;
