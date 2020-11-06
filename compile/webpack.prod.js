const { merge } = require("webpack-merge");
const {
    resolve,
    webpackConfig,
    target,
    pkgJson,
} = require("./webpack.common.js");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;

const config = merge(webpackConfig, {
    devtool: false,
    mode: "production",
    optimization: {
        usedExports: true,
        minimize: false,
    },
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "/tmp/report.html",
        }),
        new ZipPlugin({
            path: resolve("build"),
            filename: `${target}-${pkgJson.name}-${pkgJson.version}.zip`,
        }),
        // new webpack.LoaderOptionsPlugin({
        //     minimize: true,
        //     debug: false,
        // }),
        // new TerserPlugin(),
    ],
});

module.exports = config;
