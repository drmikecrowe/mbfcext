const { merge } = require("webpack-merge");
const {
    resolve,
    webpackConfig,
    target,
    pkgJson,
} = require("./webpack.common.js");
const webpack = require("webpack");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//     .BundleAnalyzerPlugin;
const FileManagerPlugin = require("filemanager-webpack-plugin");

const config = merge(webpackConfig, {
    devtool: false,
    mode: "production",
    optimization: {
        usedExports: true,
        minimize: true,
    },
    plugins: [
        // new BundleAnalyzerPlugin({
        //     analyzerMode: "static",
        //     generateStatsFile: true,
        //     reportFilename: `/tmp/report-${target}.html`,
        // }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    archive: [
                        {
                            source: `build/${target}/`,
                            destination: `build/${target}-${pkgJson.name}-${pkgJson.version}.zip`,
                        },
                    ],
                },
            },
        }),
    ],
});

module.exports = config;
